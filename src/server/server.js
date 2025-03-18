/**
 * Main server file for the Farkle game
 * Sets up Express server, Socket.io connections, and game state management
 */

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const gameState = require('./gameState');
const socketHandlers = require('./socketHandlers');

// Create express app and server
const app = express();
const server = http.createServer(app);

// Set up socket.io
const io = socketIO(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../../public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // Initialize socket event handlers
  socketHandlers.initializeSocketEvents(io, socket, gameState);
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameState.removePlayer(socket.id);
    
    // Notify all clients about the updated player list
    io.emit('playerList', gameState.getPlayers());
    
    // If game in progress, handle the player leaving
    if (gameState.isGameInProgress()) {
      gameState.handlePlayerDisconnect(socket.id);
      io.emit('gameState', gameState.getGameState());
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Farkle game server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to play`);
}); 