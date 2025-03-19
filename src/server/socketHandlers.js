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
      hostId: gameState.hostId,
      currentTurn: gameState.currentTurn,
      currentRoll: gameState.currentRoll,
      selectedDice: gameState.selectedDice,
      preBankedPoints: gameState.preBankedPoints,
      hasHotDice: gameState.hasHotDice
    });
    
    // Handle player joining the game
    socket.on('joinGame', (data) => {
      console.log('Join game request:', data);
      // Extract player name from the data object
      const playerName = data.playerName;
      
      if (!playerName) {
        socket.emit('error', { message: 'Player name is required' });
        return;
      }
      
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
    socket.on('setGameMode', (data) => {
      console.log('Set game mode request:', data);
      // Extract mode from the data object
      const mode = data.mode;
      
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
    
    // Handle game start (host only)
    socket.on('startGame', () => {
      console.log('Start game request from:', socket.id);
      console.log('Current host:', gameState.hostId);
      console.log('Current players:', gameState.players);
      
      if (socket.id === gameState.hostId) {
        const success = gameState.startGame();
        console.log('Start game result:', success);
        
        if (success) {
          // Emit game started event with full game state
          io.emit('gameStarted', {
            currentTurn: gameState.currentTurn,
            players: gameState.players,
            gameMode: gameState.gameMode,
            gameStarted: true
          });
          console.log('Game started');
        } else {
          socket.emit('error', { message: 'Not enough players to start the game' });
        }
      } else {
        socket.emit('error', { message: 'Only the host can start the game' });
      }
    });
    
    // Handle dice roll
    socket.on('rollDice', () => {
      const success = gameState.rollDice(socket.id);
      if (success) {
        io.emit('diceRolled', {
          currentRoll: gameState.currentRoll,
          hasHotDice: gameState.hasHotDice
        });
      } else {
        socket.emit('error', { message: 'Not your turn' });
      }
    });
    
    // Handle dice selection
    socket.on('selectDie', ({ diceIndex }) => {
      const success = gameState.selectDice(socket.id, diceIndex);
      if (success) {
        io.emit('diceSelected', {
          currentRoll: gameState.currentRoll,
          selectedDice: gameState.selectedDice,
          preBankedPoints: gameState.preBankedPoints,
          hasHotDice: gameState.hasHotDice
        });
      } else {
        socket.emit('error', { message: 'Invalid dice selection' });
      }
    });
    
    // Handle banking points
    socket.on('bankPoints', () => {
      const success = gameState.bankPoints(socket.id);
      if (success) {
        io.emit('pointsBanked', {
          players: gameState.players,
          currentTurn: gameState.currentTurn
        });
      } else {
        socket.emit('error', { message: 'Not your turn' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove player from game state
      const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
      if (playerIndex >= 0) {
        const player = gameState.players[playerIndex];
        gameState.players.splice(playerIndex, 1);
        
        // If host disconnected, assign new host
        if (player.isHost && gameState.players.length > 0) {
          gameState.players[0].isHost = true;
          gameState.hostId = gameState.players[0].id;
        }
        
        // If game was in progress, end it
        if (gameState.gameStarted) {
          gameState.gameStarted = false;
          gameState.currentTurn = null;
          gameState.currentRoll = [];
          gameState.selectedDice = [];
          gameState.preBankedPoints = 0;
          gameState.hasHotDice = false;
        }
        
        // Notify remaining players
        io.emit('playerLeft', {
          players: gameState.players,
          hostId: gameState.hostId,
          gameStarted: gameState.gameStarted
        });
      }
    });
  });
};

module.exports = { initializeSocketHandlers };
