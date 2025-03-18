/**
 * Game State Management
 * Manages the state of the Farkle game, including:
 * - Players and their scores
 * - Current game state (lobby, playing, game over)
 * - Turn management
 * - Dice rolls and scoring
 */

// Game modes with their point thresholds
const GAME_MODES = {
  Rush: 2000,
  Sprint: 4000,
  Marathon: 7000
};

// Game state singleton
const GameState = {
  // Game properties
  players: [],
  gameInProgress: false,
  gameMode: 'Sprint', // Default mode
  currentPlayerIndex: -1,
  
  // Dice and scoring for current turn
  currentDice: [],
  selectedDice: [],
  preBankedPoints: 0,
  
  // Game phase tracking
  turnStarted: false,
  rollAvailable: false,
  hotDice: false,
  
  /**
   * Reset the game state
   */
  resetGame() {
    this.gameInProgress = false;
    this.currentPlayerIndex = -1;
    this.currentDice = [];
    this.selectedDice = [];
    this.preBankedPoints = 0;
    this.turnStarted = false;
    this.rollAvailable = false;
    this.hotDice = false;
    
    // Reset player scores but keep the players
    this.players.forEach(player => {
      player.score = 0;
    });
  },
  
  /**
   * Add a new player to the game
   * @param {string} id - Socket ID of the player
   * @param {string} name - Player name
   * @returns {Object} - The newly added player
   */
  addPlayer(id, name) {
    // Don't add duplicates
    if (this.players.some(player => player.id === id)) {
      return this.getPlayer(id);
    }
    
    const newPlayer = {
      id,
      name,
      score: 0
    };
    
    this.players.push(newPlayer);
    return newPlayer;
  },
  
  /**
   * Remove a player from the game
   * @param {string} id - Socket ID of the player to remove
   */
  removePlayer(id) {
    const index = this.players.findIndex(player => player.id === id);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  },
  
  /**
   * Get a player by their socket ID
   * @param {string} id - Socket ID of the player
   * @returns {Object|null} - Player object or null if not found
   */
  getPlayer(id) {
    return this.players.find(player => player.id === id) || null;
  },
  
  /**
   * Get all players in the game
   * @returns {Array} - Array of player objects
   */
  getPlayers() {
    return [...this.players];
  },
  
  /**
   * Start a new game with the given mode
   * @param {string} mode - Game mode (Rush, Sprint, Marathon)
   */
  startGame(mode) {
    if (this.players.length < 2) {
      return false; // Not enough players
    }
    
    // Set game mode
    this.gameMode = mode;
    
    // Randomize player order or implement initial dice roll logic
    this.players = [...this.players].sort(() => Math.random() - 0.5);
    
    // Start with the first player
    this.currentPlayerIndex = 0;
    this.gameInProgress = true;
    this.turnStarted = false;
    this.rollAvailable = true;
    
    return true;
  },
  
  /**
   * Get the current player
   * @returns {Object|null} - Current player object or null if no game in progress
   */
  getCurrentPlayer() {
    if (!this.gameInProgress || this.currentPlayerIndex === -1) {
      return null;
    }
    return this.players[this.currentPlayerIndex];
  },
  
  /**
   * Move to the next player's turn
   */
  nextTurn() {
    // Reset turn state
    this.currentDice = [];
    this.selectedDice = [];
    this.preBankedPoints = 0;
    this.turnStarted = false;
    this.rollAvailable = true;
    this.hotDice = false;
    
    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  },
  
  /**
   * Roll the dice for the current player
   * @returns {Array} - The resulting dice values
   */
  rollDice() {
    if (!this.gameInProgress || !this.rollAvailable) {
      return [];
    }
    
    // Set turn as started
    this.turnStarted = true;
    
    // Calculate how many dice to roll (6 if hot dice or starting, otherwise remaining dice)
    const numDice = this.hotDice ? 6 : (this.currentDice.length === 0 ? 6 : this.currentDice.filter(die => !die.selected).length);
    
    // Generate random dice values
    this.currentDice = Array.from({ length: numDice }, () => ({
      value: Math.floor(Math.random() * 6) + 1, // 1-6
      selected: false
    }));
    
    // Reset hot dice flag after rolling
    this.hotDice = false;
    
    // After rolling, player must select at least one die before rolling again
    this.rollAvailable = false;
    
    return [...this.currentDice];
  },
  
  /**
   * Select a die from the current roll
   * @param {number} index - Index of the die to select
   * @returns {boolean} - Whether the selection was successful
   */
  selectDie(index) {
    if (!this.gameInProgress || !this.turnStarted || this.rollAvailable) {
      return false;
    }
    
    // Make sure the index is valid
    if (index < 0 || index >= this.currentDice.length) {
      return false;
    }
    
    // Make sure the die isn't already selected
    if (this.currentDice[index].selected) {
      return false;
    }
    
    // Mark the die as selected
    this.currentDice[index].selected = true;
    
    // Add to selected dice array
    this.selectedDice.push({
      value: this.currentDice[index].value
    });
    
    // Calculate points from newly selected dice
    // (This is a simplified version - actual scoring is more complex)
    const value = this.currentDice[index].value;
    if (value === 1) {
      this.preBankedPoints += 100;
    } else if (value === 5) {
      this.preBankedPoints += 50;
    }
    // Note: This doesn't handle three-of-a-kind or other combinations yet
    
    // Check if all dice are now selected
    if (this.currentDice.every(die => die.selected)) {
      // Hot dice! All dice have been selected
      this.hotDice = true;
    }
    
    // After selecting a die, the player can roll again
    this.rollAvailable = true;
    
    return true;
  },
  
  /**
   * Bank the currently accumulated points
   * @returns {boolean} - Whether banking was successful
   */
  bankPoints() {
    if (!this.gameInProgress || !this.turnStarted || this.preBankedPoints === 0) {
      return false;
    }
    
    // Add pre-banked points to the current player's score
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer) {
      currentPlayer.score += this.preBankedPoints;
    }
    
    // Move to the next player
    this.nextTurn();
    
    // Check for win condition
    this.checkWinCondition();
    
    return true;
  },
  
  /**
   * Handle a Farkle (no scoring dice in the roll)
   */
  handleFarkle() {
    // Player loses all pre-banked points for this turn
    this.preBankedPoints = 0;
    
    // Move to the next player
    this.nextTurn();
  },
  
  /**
   * Check if a player has won the game
   * @returns {boolean} - Whether a player has won
   */
  checkWinCondition() {
    const threshold = GAME_MODES[this.gameMode] || 4000;
    
    // Check if any player has reached the threshold
    const winningPlayer = this.players.find(player => player.score >= threshold);
    
    if (winningPlayer) {
      this.gameInProgress = false;
      return true;
    }
    
    return false;
  },
  
  /**
   * Handle a player disconnecting during the game
   * @param {string} playerId - Socket ID of the disconnected player
   */
  handlePlayerDisconnect(playerId) {
    // If it was the current player's turn, move to the next player
    if (this.getCurrentPlayer()?.id === playerId) {
      this.nextTurn();
    }
    
    // If there aren't enough players left, end the game
    if (this.players.length < 2) {
      this.gameInProgress = false;
    }
  },
  
  /**
   * Check if a game is currently in progress
   * @returns {boolean} - Whether a game is in progress
   */
  isGameInProgress() {
    return this.gameInProgress;
  },
  
  /**
   * Get the current state of the game
   * @returns {Object} - Current game state
   */
  getGameState() {
    return {
      players: this.getPlayers(),
      gameInProgress: this.gameInProgress,
      gameMode: this.gameMode,
      currentPlayer: this.getCurrentPlayer(),
      currentDice: this.currentDice,
      selectedDice: this.selectedDice,
      preBankedPoints: this.preBankedPoints,
      turnStarted: this.turnStarted,
      rollAvailable: this.rollAvailable,
      hotDice: this.hotDice
    };
  }
};

module.exports = GameState; 