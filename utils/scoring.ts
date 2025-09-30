
import { DieValue } from '../types';

type Counts = { [key in DieValue]: number };

const getCounts = (dice: DieValue[]): Counts => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Counts;
  dice.forEach(value => {
    counts[value]++;
  });
  return counts;
};

// Calculates the score of a specific selection of dice.
// Returns 0 if the selection is not a valid scoring combination.
export const calculateScore = (dice: DieValue[]): number => {
  if (dice.length === 0) return 0;

  let score = 0;
  let diceUsed = 0;
  const counts = getCounts(dice);
  const tempCounts = { ...counts };

  // Straights
  const isFullStraight = dice.length === 6 && Object.values(counts).every(c => c === 1);
  const isPartialStraight15 = dice.length === 5 && counts[1] === 1 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 1;
  const isPartialStraight26 = dice.length === 5 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 1 && counts[6] === 1;

  if (isFullStraight) return 1500;
  if (isPartialStraight15) return 500;
  if (isPartialStraight26) return 750;

  // N of a kind
  for (let i = 1; i <= 6; i++) {
    const val = i as DieValue;
    const count = tempCounts[val];
    if (count >= 3) {
      let threeOfAKindScore = 0;
      if (val === 1) threeOfAKindScore = 1000;
      else threeOfAKindScore = val * 100;
      
      if (count === 3) score += threeOfAKindScore;
      if (count === 4) score += threeOfAKindScore * 2;
      if (count === 5) score += threeOfAKindScore * 4;
      if (count === 6) score += threeOfAKindScore * 8;
      
      diceUsed += count;
      tempCounts[val] = 0;
    }
  }

  // Singles
  if (tempCounts[1] > 0) {
    score += tempCounts[1] * 100;
    diceUsed += tempCounts[1];
  }
  if (tempCounts[5] > 0) {
    score += tempCounts[5] * 50;
    diceUsed += tempCounts[5];
  }

  // If not all dice in the selection were used for scoring, it's an invalid selection
  if (diceUsed !== dice.length) {
    return 0;
  }

  return score;
};


// Checks if a specific die value can contribute to any scoring combination
// given all the dice in the current roll.
export const isScoringDie = (dieValue: DieValue, allDice: DieValue[]): boolean => {
  // Check if the die is a 1 or 5 (always scores alone)
  if (dieValue === 1 || dieValue === 5) return true;

  const counts = getCounts(allDice);

  // Check if this die is part of 3+ of a kind
  if (counts[dieValue] >= 3) return true;

  // Check if die is part of a straight
  const isFullStraight = allDice.length === 6 && Object.values(counts).every(c => c === 1);
  const isPartialStraight15 = allDice.length === 5 && counts[1] === 1 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 1;
  const isPartialStraight26 = allDice.length === 5 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 1 && counts[6] === 1;

  if (isFullStraight) return true;
  if (isPartialStraight15 && (dieValue >= 1 && dieValue <= 5)) return true;
  if (isPartialStraight26 && (dieValue >= 2 && dieValue <= 6)) return true;

  return false;
};

// Checks if a roll has any possible scoring dice.
export const checkForFarkle = (dice: DieValue[]): boolean => {
    const counts = getCounts(dice);

    // Check for single 1s or 5s
    if (counts[1] > 0 || counts[5] > 0) return false;

    // Check for any 3-of-a-kind or more
    for (const val in counts) {
        if (counts[val as unknown as DieValue] >= 3) return false;
    }

    // Check for straights
    const uniqueValues = [...new Set(dice)].sort();
    const uniqueString = uniqueValues.join('');
    if (uniqueString.includes('12345') || uniqueString.includes('23456')) return false;
    if (uniqueString === '123456') return false;

    return true;
};
