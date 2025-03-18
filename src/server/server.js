/**
 * Main server file for the Farkle game
 * Sets up Express server, Socket.io connections, and game state management
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');
const portfinder = require('portfinder');
const ngrok = require('ngrok');
const gameState = require('./gameState');
const socketHandlers = require('./socketHandlers');

// Initialize express app
const app = express();
const publicPath = path.join(__dirname, '../../public');

// Serve static files
app.use(express.static(publicPath));
app.use(express.json());

// API routes
app.get('/api/game-state', (req, res) => {
  res.json(gameState.getGameState());
});

// Middleware to handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Configurable port setup
const DEFAULT_PORT = 3000;
portfinder.basePort = DEFAULT_PORT;

async function startServer() {
  try {
    // Find available port
    const port = await portfinder.getPortPromise();
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize Socket.io with optimized settings
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      // Optimize for game performance
      pingTimeout: 30000,
      pingInterval: 5000,
      transports: ['websocket', 'polling'],
      maxHttpBufferSize: 1e6, // 1MB - adjust as needed
      // Disconnect inactive clients
      connectTimeout: 45000
    });
    
    // Socket handlers
    io.on('connection', (socket) => {
      console.log(`Player connected: ${socket.id}`);
      
      // Join game
      socket.on('joinGame', (playerData) => {
        const player = gameState.addPlayer(socket.id, playerData.name || playerData);
        
        // Broadcast updated player list
        io.emit('playerList', gameState.players);
        console.log(`${player.name} joined the game`);
      });
      
      // Set game mode
      socket.on('setGameMode', (mode) => {
        gameState.gameMode = mode;
        io.emit('gameModeUpdate', mode);
      });
      
      // Start game
      socket.on('startGame', (mode) => {
        if (gameState.startGame(mode)) {
          console.log(`Game started in ${mode || 'Sprint'} mode`);
          io.emit('gameStarted', gameState.getGameState());
        }
      });
      
      // Roll dice
      socket.on('rollDice', () => {
        const result = gameState.rollDice(socket.id);
        if (result) {
          io.emit('diceRolled', {
            playerId: socket.id,
            ...result,
            gameState: gameState.getGameState()
          });
        }
      });
      
      // Select die
      socket.on('selectDie', (index) => {
        if (gameState.selectDie(socket.id, index)) {
          io.emit('dieSelected', {
            playerId: socket.id,
            index,
            gameState: gameState.getGameState()
          });
        }
      });
      
      // End turn / bank points
      socket.on('bankPoints', () => {
        const result = gameState.bankPoints(socket.id);
        if (result && result.success) {
          if (result.winner) {
            io.emit('gameWon', {
              winner: socket.id,
              gameState: gameState.getGameState()
            });
          } else {
            io.emit('pointsBanked', {
              playerId: socket.id,
              nextPlayer: gameState.currentTurn,
              gameState: gameState.getGameState()
            });
          }
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        const player = gameState.players.find(p => p.id === socket.id);
        
        if (player) {
          console.log(`Player disconnected: ${player.name}`);
          
          // Remove player
          gameState.removePlayer(socket.id);
          
          // Update all clients
          io.emit('playerLeft', {
            playerId: socket.id,
            gameState: gameState.getGameState()
          });
        }
      });
    });
    
    // Start the server
    server.listen(port, () => {
      console.log(`\n🎲 Farkle server running on port ${port}`);
      console.log(`\n👉 Local access: http://localhost:${port}`);
      
      // Log network access URLs
      const networkInterfaces = os.networkInterfaces();
      Object.keys(networkInterfaces).forEach(interfaceName => {
        const interfaces = networkInterfaces[interfaceName];
        interfaces.forEach(iface => {
          if (iface.family === 'IPv4' && !iface.internal) {
            console.log(`\n👉 Network access: http://${iface.address}:${port}`);
          }
        });
      });
      
      // Start ngrok for public access
      if (process.env.NODE_ENV !== 'test') {
        setupNgrok(port);
      }
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Trying another port...`);
        portfinder.getPortPromise().then(newPort => {
          console.log(`Attempting to use port ${newPort} instead.`);
          server.listen(newPort);
        });
      } else {
        console.error('Server error:', error);
      }
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Setup ngrok tunnel
async function setupNgrok(port) {
  try {
    const url = await ngrok.connect({
      addr: port,
    });
    console.log(`\n🌐 Public game URL: ${url}`);
    console.log('\n📋 Share this URL with friends to let them join your game!');
  } catch (error) {
    console.log('\n⚠️ Ngrok tunnel not established. Running in local network only.');
    console.log('   To enable public access, sign up for a free ngrok account and set NGROK_AUTH_TOKEN in your environment.');
  }
}

// Handle unexpected errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Attempt to gracefully shut down
  process.exit(1);
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; 