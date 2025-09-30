
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

// Multiplayer types
export interface Player {
  id: string;
  nickname: string;
  score: number;
  isReady: boolean;
}

export interface MultiplayerGameState {
  currentPlayerIndex: number;
  currentPlayerTurn: string;
  dice: Die[];
  keptDice: Die[];
  turnScore: number;
  gameStatus: string;
}

export interface Lobby {
  code: string;
  host: string;
  players: Player[];
  gameState: MultiplayerGameState | null;
  isGameStarted: boolean;
}

export enum Screen {
  LobbyCreation = 'LOBBY_CREATION',
  Lobby = 'LOBBY',
  Game = 'GAME',
}
