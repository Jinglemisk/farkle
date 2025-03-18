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

// Dice scoring rules
const SCORING = {
  // Single dice scores
  single: {
    1: 100,
    5: 50
  },
  // Three of a kind scores
  threeOfAKind: {
    1: 1000,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
    6: 600
  },
  // Special combinations
  straight: {
    partial1: 500, // 1,2,3,4,5
    partial2: 750, // 2,3,4,5,6
    full: 1500     // 1,2,3,4,5,6
  }
};

// Game state module
class GameState {
  constructor() {
    this.resetGame();
  }

  // Reset the game to initial state
  resetGame() {
    this.players = [];
    this.scores = {};
    this.gameMode = 'Sprint';
    this.gameStarted = false;
    this.currentTurn = null;
    this.activeDice = [];
    this.selectedDice = [];
    this.turnScore = 0;
    this.rollCount = 0;
    this.hasHotDice = false;
  }

  // Add a player to the game
  addPlayer(playerId, playerName) {
    if (!this.players.some(p => p.id === playerId)) {
      const player = { id: playerId, name: playerName };
      this.players.push(player);
      this.scores[playerId] = 0;
      return player;
    }
    return this.players.find(p => p.id === playerId);
  }

  // Remove a player from the game
  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
      delete this.scores[playerId];
      
      if (this.currentTurn === playerId) {
        this.moveToNextPlayer();
      }
    }
  }
  
  // Get win score based on game mode
  getWinScore() {
    return GAME_MODES[this.gameMode] || GAME_MODES.Sprint;
  }
  
  // Start the game
  startGame(mode) {
    if (this.players.length < 2) {
      return false;
    }
    
    this.gameMode = mode || 'Sprint';
    this.gameStarted = true;
    this.currentTurn = this.players[0].id;
    
    return true;
  }
  
  // Roll dice for current player
  rollDice(playerId) {
    if (!this.gameStarted || this.currentTurn !== playerId) {
      return null;
    }
    
    // Determine number of dice to roll
    const diceCount = this.hasHotDice ? 6 : (6 - this.selectedDice.length);
    
    // Roll the dice
    this.activeDice = Array.from({ length: diceCount }, () => ({
      value: Math.floor(Math.random() * 6) + 1,
      selected: false
    }));
    
    this.rollCount++;
    this.hasHotDice = false;
    
    // Check for Farkle (no scoring dice)
    if (!this.hasScoringDice()) {
      this.handleFarkle();
      return { farkle: true, dice: this.activeDice };
    }
    
    return { dice: this.activeDice };
  }
  
  // Check if current roll has any scoring dice
  hasScoringDice() {
    // Check for any 1s or 5s
    if (this.activeDice.some(die => die.value === 1 || die.value === 5)) {
      return true;
    }
    
    // Check for three or more of a kind
    for (let i = 1; i <= 6; i++) {
      const count = this.activeDice.filter(die => die.value === i).length;
      if (count >= 3) {
        return true;
      }
    }
    
    // Check for straights (simplified)
    const values = this.activeDice.map(die => die.value).sort();
    if (
      (values.join(',') === '1,2,3,4,5,6') || 
      (values.join(',') === '1,2,3,4,5') || 
      (values.join(',') === '2,3,4,5,6')
    ) {
      return true;
    }
    
    return false;
  }
  
  // Handle a Farkle (no scoring dice)
  handleFarkle() {
    this.turnScore = 0;
    this.selectedDice = [];
    this.moveToNextPlayer();
    return true;
  }
  
  // Select a die from the current roll
  selectDie(playerId, dieIndex) {
    if (!this.gameStarted || this.currentTurn !== playerId || dieIndex >= this.activeDice.length) {
      return false;
    }
    
    const die = this.activeDice[dieIndex];
    if (die.selected) {
      return false;
    }
    
    // Mark the die as selected
    die.selected = true;
    
    // Add to selected dice
    this.selectedDice.push(die);
    
    // Calculate score (simplified - only handling singles for now)
    if (die.value === 1) {
      this.turnScore += SCORING.single[1];
    } else if (die.value === 5) {
      this.turnScore += SCORING.single[5];
    }
    
    // Check for hot dice (all dice selected)
    if (this.activeDice.every(die => die.selected)) {
      this.hasHotDice = true;
    }
    
    return true;
  }
  
  // Bank points and end turn
  bankPoints(playerId) {
    if (!this.gameStarted || this.currentTurn !== playerId || this.turnScore === 0) {
      return false;
    }
    
    // Add points to player's score
    this.scores[playerId] += this.turnScore;
    
    // Check for winner
    const isWinner = this.scores[playerId] >= this.getWinScore();
    
    // Reset turn state
    this.turnScore = 0;
    this.selectedDice = [];
    this.activeDice = [];
    this.rollCount = 0;
    this.hasHotDice = false;
    
    // Move to next player
    this.moveToNextPlayer();
    
    return { success: true, winner: isWinner };
  }
  
  // Move to the next player's turn
  moveToNextPlayer() {
    if (this.players.length === 0) {
      this.currentTurn = null;
      return;
    }
    
    const currentIndex = this.players.findIndex(p => p.id === this.currentTurn);
    const nextIndex = (currentIndex + 1) % this.players.length;
    this.currentTurn = this.players[nextIndex].id;
  }
  
  // Get current game state
  getGameState() {
    return {
      players: this.players,
      scores: this.scores,
      gameMode: this.gameMode,
      gameStarted: this.gameStarted,
      currentTurn: this.currentTurn,
      activeDice: this.activeDice,
      selectedDice: this.selectedDice,
      turnScore: this.turnScore,
      hasHotDice: this.hasHotDice
    };
  }
}

module.exports = new GameState(); 