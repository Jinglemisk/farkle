
export const WINNING_SCORE = 500;
export const DICE_COUNT = 6;

export const GAME_MODES = {
  rush: { label: 'Rush', winningScore: 1000 },
  standard: { label: 'Standard', winningScore: 2000 },
  marathon: { label: 'Marathon', winningScore: 4000 },
} as const;

export function getWinningScore(gameMode: 'rush' | 'standard' | 'marathon'): number {
  return GAME_MODES[gameMode].winningScore;
}
