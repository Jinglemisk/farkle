/**
 * Main server file for the Farkle game
 * Sets up Express server, Socket.io connections, and game state management
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const { initializeSocketHandlers } = require('./socketHandlers');
const { initGameState } = require('./gameState');

// Initialize the game state
const gameState = initGameState();

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Serve Socket.io client from node_modules
app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../../node_modules/socket.io-client/dist/socket.io.js'));
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.get('/api/game-status', (req, res) => {
  res.json({
    players: gameState.players,
    gameMode: gameState.gameMode,
    gameStarted: gameState.gameStarted
  });
});

// Create HTTP server and Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize Socket.io handlers
initializeSocketHandlers(io, gameState);

// Start server
const PORT = process.env.PORT || 8765;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://<your-ip-address>:${PORT}`);
});
