/**
 * Socket.io event handlers for Farkle game
 * Manages real-time communication between server and clients
 */

const initializeSocketHandlers = (io, gameState) => {
  // Connection event
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Send current game state to the newly connected client
    socket.emit('gameState', {
      players: gameState.players,
      gameMode: gameState.gameMode,
      gameStarted: gameState.gameStarted,
      hostId: gameState.hostId
    });
    
    // Handle player joining the game
    socket.on('joinGame', ({ playerName }) => {
      // Add player to game state
      const player = gameState.addPlayer(socket.id, playerName);
      
      // Notify all clients about the new player
      io.emit('playerJoined', { player, players: gameState.players });
      
      // If this player is the host, notify them
      if (player.isHost) {
        socket.emit('hostAssigned');
      }
      
      console.log(`${playerName} joined the game. Total players: ${gameState.players.length}`);
    });
    
    // Handle game mode change (host only)
    socket.on('setGameMode', ({ mode }) => {
      // Only the host can change the game mode
      if (socket.id === gameState.hostId) {
        const success = gameState.setGameMode(mode);
        if (success) {
          io.emit('gameModeChanged', { gameMode: gameState.gameMode });
          console.log(`Game mode changed to ${mode}`);
        }
      } else {
        // Send error to non-host player who attempted to change mode
        socket.emit('error', { message: 'Only the host can change the game mode' });
      }
    });
    
    // Handle start game request (host only)
    socket.on('startGame', () => {
      // Only the host can start the game
      if (socket.id === gameState.hostId) {
        const success = gameState.startGame();
        if (success) {
          io.emit('gameStarted');
          console.log('Game started');
        } else {
          socket.emit('error', { message: 'Not enough players to start the game' });
        }
      } else {
        socket.emit('error', { message: 'Only the host can start the game' });
      }
    });
    
    // Handle player ready toggle
    socket.on('toggleReady', () => {
      const isReady = gameState.togglePlayerReady(socket.id);
      io.emit('playerReadyChanged', { playerId: socket.id, isReady });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      const players = gameState.removePlayer(socket.id);
      io.emit('playerLeft', { playerId: socket.id, players });
      console.log(`Player disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initializeSocketHandlers };
