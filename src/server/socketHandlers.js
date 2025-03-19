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
          // Get initial rolls from players with their roll values
          const initialRolls = gameState.players.map(player => ({
            id: player.id,
            name: player.name,
            roll: player.roll
          }));

          // Emit game started event with full game state
          io.emit('gameStarted', {
            players: gameState.players,
            gameMode: gameState.gameMode,
            gameStarted: true,
            currentTurn: gameState.currentTurn,
            initialRolls: initialRolls,
            currentRoll: [],
            selectedDice: [],
            preBankedPoints: 0,
            hasHotDice: false
          });

          // After a short delay, emit the game state to start the first turn
          setTimeout(() => {
            io.emit('gameState', {
              players: gameState.players,
              gameMode: gameState.gameMode,
              gameStarted: true,
              currentTurn: gameState.currentTurn,
              currentRoll: [],
              selectedDice: [],
              preBankedPoints: 0,
              hasHotDice: false
            });
          }, 3000); // 3 second delay to show initial rolls

          console.log('Game started with initial rolls:', initialRolls);
        } else {
          socket.emit('error', { message: 'Not enough players to start the game' });
        }
      } else {
        socket.emit('error', { message: 'Only the host can start the game' });
      }
    });
    
    // Handle dice roll
    socket.on('rollDice', () => {
      const result = gameState.rollDice(socket.id);
      
      if (result.error) {
        socket.emit('error', { message: result.error });
        return;
      }
      
      if (result.farkle) {
        // Notify all players about the Farkle and turn change
        io.emit('farkle', {
          players: gameState.players,
          currentTurn: gameState.currentTurn,
          currentRoll: [],
          selectedDice: [],
          preBankedPoints: 0,
          hasHotDice: false
        });

        // Also emit a game state update to ensure synchronization
        io.emit('gameState', {
          players: gameState.players,
          currentTurn: gameState.currentTurn,
          currentRoll: [],
          selectedDice: [],
          preBankedPoints: 0,
          hasHotDice: false,
          gameStarted: gameState.gameStarted
        });
        return;
      }
      
      if (result.success) {
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
        // Get the updated player scores and current turn
        const updatedPlayers = gameState.players.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score,
          isHost: player.isHost
        }));

        // Emit full game state update to ensure next player starts fresh
        io.emit('pointsBanked', {
          players: updatedPlayers, // Send updated player scores
          currentTurn: gameState.currentTurn,
          currentRoll: [], // Reset dice for next player
          selectedDice: [], // Reset selected dice
          preBankedPoints: 0, // Reset pre-banked points
          hasHotDice: false, // Reset hot dice status
          gameMode: gameState.gameMode // Include game mode for win condition checking
        });

        // Also emit a separate game state update to ensure consistency
        io.emit('gameState', {
          players: updatedPlayers,
          currentTurn: gameState.currentTurn,
          currentRoll: [],
          selectedDice: [],
          preBankedPoints: 0,
          hasHotDice: false,
          gameMode: gameState.gameMode,
          gameStarted: gameState.gameStarted
        });
      } else {
        socket.emit('error', { message: 'Not your turn' });
      }
    });
    
    // Handle request for game state update
    socket.on('requestGameState', () => {
      io.emit('gameState', {
        players: gameState.players,
        gameMode: gameState.gameMode,
        gameStarted: gameState.gameStarted,
        currentTurn: gameState.currentTurn,
        currentRoll: gameState.currentRoll,
        selectedDice: gameState.selectedDice,
        preBankedPoints: gameState.preBankedPoints,
        hasHotDice: gameState.hasHotDice
      });
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
