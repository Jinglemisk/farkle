/**
 * Dice Utilities
 * Functions for working with dice rolls and states
 */

/**
 * Generate a random dice roll
 * @param {number} numDice - Number of dice to roll (default: 6)
 * @returns {Array} - Array of dice objects with values and states
 */
export const rollDice = (numDice = 6) => {
  const dice = [];
  for (let i = 0; i < numDice; i++) {
    dice.push({
      value: Math.floor(Math.random() * 6) + 1, // 1-6
      selected: false,
      locked: false
    });
  }
  return dice;
};

/**
 * Check if a die is selectable (can be part of a scoring combination)
 * Must be integrated with game logic for valid scoring combinations
 * @param {number} value - Die value (1-6)
 * @param {Array} currentDice - Current dice array
 * @returns {boolean} - Whether the die is selectable
 */
export const isDieSelectable = (value, currentDice) => {
  // Ones and fives are always selectable
  if (value === 1 || value === 5) return true;
  
  // Count occurrences of this value
  const count = currentDice.filter(die => die.value === value).length;
  
  // Three or more of a kind is selectable
  if (count >= 3) return true;
  
  // TODO: Check if it's part of a straight
  
  return false;
};

/**
 * Filter selectable dice from a roll
 * @param {Array} dice - Array of dice values/objects
 * @returns {Array} - Array of indices of selectable dice
 */
export const getSelectableDice = (dice) => {
  // Extract just the values if we have objects
  const values = dice.map(die => die.value || die);
  
  return dice.map((die, index) => {
    const value = die.value || die;
    return isDieSelectable(value, values) ? index : null;
  }).filter(index => index !== null);
};

/**
 * Check if all dice are locked (selected and can't be rerolled)
 * @param {Array} dice - Array of dice objects
 * @returns {boolean} - True if all dice are locked
 */
export const allDiceLocked = (dice) => {
  return dice.every(die => die.locked);
};

/**
 * Get the current number of dice available for rolling
 * @param {Array} dice - Array of dice objects 
 * @returns {number} - Number of dice available for rolling
 */
export const getAvailableDiceCount = (dice) => {
  return dice.filter(die => !die.locked).length;
}; 