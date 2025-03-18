/**
 * Game Logic Utilities
 * Contains all the core game logic functions for the Farkle game
 * These functions handle scoring, dice combinations, and win conditions
 */

/**
 * Calculate the score for a set of dice
 * @param {Array} dice - Array of dice values (1-6)
 * @returns {number} - The score for the given dice combination
 */
export const calculateScore = (dice) => {
  // Clone the dice array to avoid modifying the original
  const diceValues = [...dice];
  let score = 0;

  // Check for straights first (they're special cases)
  if (isStraight(diceValues)) {
    return getStraightScore(diceValues);
  }

  // Count occurrences of each value
  const valueCounts = countValues(diceValues);
  
  // Calculate score based on combinations
  for (let value = 1; value <= 6; value++) {
    const count = valueCounts[value] || 0;
    
    // Three or more of a kind
    if (count >= 3) {
      score += getMultipleScore(value, count);
      valueCounts[value] = 0; // Remove these dice from further scoring
    }
  }
  
  // Add remaining individual 1's and 5's
  score += (valueCounts[1] || 0) * 100; // Each 1 is worth 100 points
  score += (valueCounts[5] || 0) * 50;  // Each 5 is worth 50 points
  
  return score;
};

/**
 * Check if the dice form a straight
 * @param {Array} dice - Array of dice values (1-6)
 * @returns {boolean} - True if the dice form a straight
 */
export const isStraight = (dice) => {
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
};

/**
 * Get the score for a straight
 * @param {Array} dice - Array of dice values (1-6)
 * @returns {number} - The score for the straight
 */
export const getStraightScore = (dice) => {
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
};

/**
 * Count how many of each value are in the dice array
 * @param {Array} dice - Array of dice values (1-6)
 * @returns {Object} - Object with counts for each value
 */
export const countValues = (dice) => {
  return dice.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
};

/**
 * Get score for multiple of the same value
 * @param {number} value - The value of the dice (1-6)
 * @param {number} count - How many of the value (3-6)
 * @returns {number} - The score for the multiple
 */
export const getMultipleScore = (value, count) => {
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
};

/**
 * Check if a roll is a Farkle (no scoring dice)
 * @param {Array} dice - Array of dice values (1-6)
 * @returns {boolean} - True if the roll is a Farkle
 */
export const isFarkle = (dice) => {
  // A roll is a Farkle if it scores 0 points
  return calculateScore(dice) === 0;
};

/**
 * Get the point threshold for a game mode
 * @param {string} gameMode - Game mode (Rush, Sprint, Marathon)
 * @returns {number} - Point threshold to win
 */
export const getWinThreshold = (gameMode) => {
  switch (gameMode) {
    case 'Rush':
      return 2000;
    case 'Sprint':
      return 4000;
    case 'Marathon':
      return 7000;
    default:
      return 4000; // Default to Sprint
  }
};

/**
 * Check if any player has reached the win threshold
 * @param {Array} players - Array of player objects with scores
 * @param {string} gameMode - Game mode (Rush, Sprint, Marathon)
 * @returns {boolean} - True if a player has reached the win threshold
 */
export const checkWinCondition = (players, gameMode) => {
  const threshold = getWinThreshold(gameMode);
  return players.some(player => player.score >= threshold);
}; 