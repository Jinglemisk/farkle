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
      if (this.players.length >= 1) { // Allow starting with just 1 player for testing
        this.gameStarted = true;
        return true;
      }
      return false;
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
    }
  };
};

module.exports = { initGameState };
