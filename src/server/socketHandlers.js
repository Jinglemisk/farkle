/**
 * Socket.io Event Handlers
 * Handles all socket events for the Farkle game
 * - Player joining/leaving
 * - Game starting
 * - Dice rolling
 * - Scoring
 * - Turn management
 */

/**
 * Initialize socket event handlers for a connected client
 * @param {Object} io - The Socket.io server instance
 * @param {Object} socket - The connected client's socket
 * @param {Object} gameState - The shared game state
 */
function initializeSocketEvents(io, socket, gameState) {
  /**
   * Handle player joining the game
   * @param {string} playerName - The player's name
   */
  socket.on('joinGame', (playerName) => {
    // Add player to game state
    const player = gameState.addPlayer(socket.id, playerName);
    
    // Send updated player list to all clients
    io.emit('playerList', gameState.getPlayers());
    
    console.log(`Player joined: ${playerName} (${socket.id})`);
  });
  
  /**
   * Handle game start request (from host)
   * @param {string} gameMode - The selected game mode
   */
  socket.on('startGame', (gameMode) => {
    // Only first player (host) can start the game
    const players = gameState.getPlayers();
    if (players.length > 0 && players[0].id === socket.id) {
      if (gameState.startGame(gameMode)) {
        console.log(`Game started in ${gameMode} mode`);
        
        // Notify all clients that the game has started
        io.emit('gameStarted');
        
        // Send initial game state to all clients
        io.emit('gameState', gameState.getGameState());
      }
    }
  });
  
  /**
   * Handle dice roll request
   */
  socket.on('rollDice', () => {
    // Check if it's this player's turn
    const currentPlayer = gameState.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== socket.id) {
      return;
    }
    
    // Roll the dice
    const roll = gameState.rollDice();
    console.log(`Player ${currentPlayer.name} rolled: ${roll.map(d => d.value).join(', ')}`);
    
    // TODO: Check for Farkle (no scoring dice)
    
    // Send updated game state to all clients
    io.emit('gameState', gameState.getGameState());
  });
  
  /**
   * Handle die selection
   * @param {number} index - Index of the die being selected
   */
  socket.on('selectDie', (index) => {
    // Check if it's this player's turn
    const currentPlayer = gameState.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== socket.id) {
      return;
    }
    
    // Select the die
    if (gameState.selectDie(index)) {
      console.log(`Player ${currentPlayer.name} selected die #${index}`);
      
      // Send updated game state to all clients
      io.emit('gameState', gameState.getGameState());
    }
  });
  
  /**
   * Handle banking points
   */
  socket.on('bankPoints', () => {
    // Check if it's this player's turn
    const currentPlayer = gameState.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== socket.id) {
      return;
    }
    
    // Bank the points
    if (gameState.bankPoints()) {
      console.log(`Player ${currentPlayer.name} banked ${gameState.preBankedPoints} points`);
      
      // Check if game has ended
      if (!gameState.isGameInProgress()) {
        console.log('Game over!');
        io.emit('gameOver', gameState.getPlayers());
      }
      
      // Send updated game state to all clients
      io.emit('gameState', gameState.getGameState());
    }
  });
  
  /**
   * Handle player ready for new game
   */
  socket.on('readyForNewGame', () => {
    // TODO: Implement logic for starting a new game after one ends
  });
}

module.exports = {
  initializeSocketEvents
};