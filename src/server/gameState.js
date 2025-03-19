/**
 * Game state management for Farkle
 * Handles player tracking, game modes, and overall game state
 */

const initGameState = () => {
  // Initial game state
  return {
    players: [],
    gameMode: 'Sprint', // Default game mode: Rush, Sprint, or Marathon
    gameStarted: false,
    hostId: null,
    currentTurn: null,
    currentRoll: [],
    selectedDice: [],
    preBankedPoints: 0,
    hasHotDice: false,
    
    // Game mode point thresholds
    gameModes: {
      Rush: 2000,
      Sprint: 4000, 
      Marathon: 7000
    },
    
    // Add a player to the game
    addPlayer(playerId, playerName) {
      // Check if player already exists
      const existingPlayerIndex = this.players.findIndex(p => p.id === playerId);
      
      if (existingPlayerIndex >= 0) {
        // Update existing player name
        this.players[existingPlayerIndex].name = playerName;
        return this.players[existingPlayerIndex];
      }
      
      // Create new player
      const newPlayer = {
        id: playerId,
        name: playerName,
        score: 0,
        isHost: this.players.length === 0, // First player is the host
        isReady: false
      };
      
      // Set host ID if this is the first player
      if (this.players.length === 0) {
        this.hostId = playerId;
      }
      
      this.players.push(newPlayer);
      return newPlayer;
    },
    
    // Remove a player from the game
    removePlayer(playerId) {
      this.players = this.players.filter(p => p.id !== playerId);
      
      // If host left, assign new host if there are any players left
      if (playerId === this.hostId && this.players.length > 0) {
        this.hostId = this.players[0].id;
        this.players[0].isHost = true;
      }
      
      return this.players;
    },
    
    // Set game mode (Rush, Sprint, Marathon)
    setGameMode(mode) {
      if (this.gameModes[mode] !== undefined) {
        this.gameMode = mode;
        return true;
      }
      return false;
    },
    
    // Start the game
    startGame() {
      if (this.players.length < 2) return false;
      
      // Roll for turn order
      const turnOrder = this.players.map(player => ({
        ...player,
        roll: Math.floor(Math.random() * 6) + 1
      })).sort((a, b) => b.roll - a.roll);
      
      // Set first player
      this.currentTurn = turnOrder[0].id;
      this.gameStarted = true;
      return true;
    },
    
    // Reset the game state
    resetGame() {
      this.gameStarted = false;
      this.players.forEach(p => {
        p.score = 0;
        p.isReady = false;
      });
      return true;
    },

    // Get all players in the game
    getPlayers() {
      return this.players;
    },
    
    // Toggle player ready status
    togglePlayerReady(playerId) {
      const player = this.players.find(p => p.id === playerId);
      if (player) {
        player.isReady = !player.isReady;
        return player.isReady;
      }
      return false;
    },

    // Roll dice for current player
    rollDice(playerId) {
      if (playerId !== this.currentTurn) return false;
      
      // If hot dice, roll all 6 dice
      const numDice = this.hasHotDice ? 6 : (6 - this.selectedDice.length);
      this.currentRoll = Array(numDice).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
      this.hasHotDice = false;
      return true;
    },

    // Select dice for scoring
    selectDice(playerId, diceIndex) {
      if (playerId !== this.currentTurn) return false;
      
      const die = this.currentRoll[diceIndex];
      if (!die) return false;
      
      // Add die to selected dice
      this.selectedDice.push(die);
      this.currentRoll.splice(diceIndex, 1);
      
      // Calculate new pre-banked points
      this.preBankedPoints = this.calculateScore(this.selectedDice);
      
      // Check for hot dice
      this.hasHotDice = this.selectedDice.length === 6;
      
      return true;
    },

    // Bank points for current player
    bankPoints(playerId) {
      if (playerId !== this.currentTurn) return false;
      
      // Add points to player's score
      const playerIndex = this.players.findIndex(p => p.id === playerId);
      if (playerIndex >= 0) {
        this.players[playerIndex].score += this.preBankedPoints;
      }
      
      // Reset turn state
      this.currentRoll = [];
      this.selectedDice = [];
      this.preBankedPoints = 0;
      this.hasHotDice = false;
      
      // Move to next player
      const currentIndex = this.players.findIndex(p => p.id === playerId);
      const nextIndex = (currentIndex + 1) % this.players.length;
      this.currentTurn = this.players[nextIndex].id;
      
      return true;
    },

    // Calculate score for a set of dice
    calculateScore(dice) {
      // Clone the dice array to avoid modifying the original
      const diceValues = [...dice];
      let score = 0;

      // Check for straights first
      if (this.isStraight(diceValues)) {
        return this.getStraightScore(diceValues);
      }

      // Count occurrences of each value
      const valueCounts = this.countValues(diceValues);
      
      // Calculate score based on combinations
      for (let value = 1; value <= 6; value++) {
        const count = valueCounts[value] || 0;
        
        // Three or more of a kind
        if (count >= 3) {
          score += this.getMultipleScore(value, count);
          valueCounts[value] = 0; // Remove these dice from further scoring
        }
      }
      
      // Add remaining individual 1's and 5's
      score += (valueCounts[1] || 0) * 100; // Each 1 is worth 100 points
      score += (valueCounts[5] || 0) * 50;  // Each 5 is worth 50 points
      
      return score;
    },

    // Helper functions for scoring
    isStraight(dice) {
      if (dice.length !== 6) return false;
      
      const sorted = [...dice].sort((a, b) => a - b);
      
      // Check for 1-2-3-4-5-6
      const fullStraight = [1, 2, 3, 4, 5, 6];
      if (sorted.every((val, index) => val === fullStraight[index])) {
        return true;
      }
      
      // If we have exactly 5 dice, check for partial straights
      if (dice.length === 5) {
        // Check for 1-2-3-4-5
        const partialStraight1 = [1, 2, 3, 4, 5];
        if (sorted.every((val, index) => val === partialStraight1[index])) {
          return true;
        }
        
        // Check for 2-3-4-5-6
        const partialStraight2 = [2, 3, 4, 5, 6];
        if (sorted.every((val, index) => val === partialStraight2[index])) {
          return true;
        }
      }
      
      return false;
    },

    getStraightScore(dice) {
      const sorted = [...dice].sort((a, b) => a - b);
      
      // Full straight: 1-2-3-4-5-6
      if (sorted.length === 6 && sorted[0] === 1 && sorted[5] === 6) {
        return 1500;
      }
      
      // Partial straight: 1-2-3-4-5
      if (sorted.length === 5 && sorted[0] === 1 && sorted[4] === 5) {
        return 500;
      }
      
      // Partial straight: 2-3-4-5-6
      if (sorted.length === 5 && sorted[0] === 2 && sorted[4] === 6) {
        return 750;
      }
      
      return 0;
    },

    countValues(dice) {
      return dice.reduce((counts, value) => {
        counts[value] = (counts[value] || 0) + 1;
        return counts;
      }, {});
    },

    getMultipleScore(value, count) {
      if (count < 3) return 0;
      
      // Base scores for three of a kind
      const baseScores = {
        1: 1000,
        2: 200,
        3: 300,
        4: 400,
        5: 500,
        6: 600
      };
      
      let score = baseScores[value] || 0;
      
      // Double the score for each additional die beyond 3
      for (let i = 3; i < count; i++) {
        score *= 2;
      }
      
      return score;
    }
  };
};

module.exports = { initGameState };
