
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface Die {
  id: number;
  value: DieValue;
  isSelected: boolean;
}

export enum GameStatus {
  NotStarted = 'NOT_STARTED',
  PlayerTurn = 'PLAYER_TURN',
  DiceRolled = 'DICE_ROLLED',
  GameOverWin = 'GAME_OVER_WIN',
  GameOverFarkle = 'GAME_OVER_FARKLE',
}
