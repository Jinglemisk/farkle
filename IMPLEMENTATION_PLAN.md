# Farkle: Singleplayer/Multiplayer Toggle Implementation Plan

## Overview

Add a toggle in the lobby creation screen that allows users to choose between singleplayer and multiplayer modes before starting the game. The toggle will control the visibility/state of the lobby code field and update all descriptive text accordingly.

## Current Architecture

- **App.tsx** (lines 14-33): Uses `useMultiplayerGame` hook exclusively
- **LobbyCreationScreen.tsx**: Shows lobby code field, multiplayer-focused tips and messaging
- **useFarkleGame.ts**: Unused singleplayer hook with local state management
- **useMultiplayerGame.ts**: Active multiplayer hook with Socket.io server communication
- **Screen flow**: LobbyCreation → Lobby → Game (multiplayer only)

## Recommended Approach

Implement a **lightweight, minimal-change solution** that adds a mode toggle to LobbyCreationScreen and uses conditional rendering in App.tsx to switch between multiplayer and singleplayer game flows.

### Key Architectural Decisions

1. **State Management**: Use React `useState` in App.tsx (no Context needed for this simple case)
2. **Component Structure**: Split App.tsx into `MultiplayerApp` and `SingleplayerApp` components
3. **Mode Selection**: Pass mode selection from LobbyCreationScreen up to App.tsx
4. **Singleplayer Flow**: LobbyCreation → SingleplayerLobby → Game

### Rationale

- **Simplest solution**: Avoids adding Context API overhead for a single piece of state
- **React hooks compliance**: Separate component trees ensure hooks are called unconditionally
- **Code reuse**: LobbyCreationScreen shared between both modes with conditional UI
- **Minimal refactoring**: Most of App.tsx remains unchanged, just wrapped in MultiplayerApp

## Implementation Steps

### 1. Update LobbyCreationScreen.tsx

**Changes needed**:

a. **Add play mode state** (after line 14):
```typescript
const [playMode, setPlayMode] = useState<'singleplayer' | 'multiplayer'>('multiplayer');
```

b. **Add mode toggle UI** (insert after avatar selection, around line 92):
```typescript
<div>
  <label className="block text-amber-200 text-xs sm:text-sm font-semibold mb-2">
    Play Mode
  </label>
  <div className="flex items-center gap-2 bg-stone-900/80 border border-amber-700 rounded-lg p-1">
    <button
      type="button"
      onClick={() => setPlayMode('singleplayer')}
      className={`flex-1 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
        playMode === 'singleplayer'
          ? 'bg-amber-500 text-stone-900'
          : 'text-amber-200 hover:bg-amber-500/20'
      }`}
    >
      Solo
    </button>
    <button
      type="button"
      onClick={() => setPlayMode('multiplayer')}
      className={`flex-1 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
        playMode === 'multiplayer'
          ? 'bg-amber-500 text-stone-900'
          : 'text-amber-200 hover:bg-amber-500/20'
      }`}
    >
      Multiplayer
    </button>
  </div>
</div>
```

c. **Disable lobby code field when singleplayer** (line 98):
```typescript
<input
  type="text"
  id="lobbyCode"
  value={lobbyCode}
  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
  maxLength={6}
  placeholder="Enter 6-letter code to join"
  disabled={playMode === 'singleplayer'}  // ADD THIS
  className={`w-full px-4 py-2.5 border-2 border-amber-600 rounded-lg text-amber-100 placeholder-stone-400 focus:outline-none transition-colors ${
    playMode === 'singleplayer'
      ? 'bg-stone-800 cursor-not-allowed opacity-50'
      : 'bg-stone-700 focus:border-amber-400'
  }`}
/>
<p className="text-stone-400 text-xs mt-1">
  {playMode === 'singleplayer'
    ? 'Not available in singleplayer mode'
    : 'Leave empty to create a new lobby'}
</p>
```

d. **Update sidebar text** (lines 127-143):
```typescript
<aside className="...">
  <div>
    <h3 className="text-amber-200 font-semibold text-base mb-2">Quick Tips</h3>
    <ul className="space-y-1 text-stone-300">
      {playMode === 'multiplayer' ? (
        <>
          <li>• Share the code so friends can join instantly.</li>
          <li>• Avatars help other players spot you quickly.</li>
          <li>• A new lobby is created when no code is entered.</li>
        </>
      ) : (
        <>
          <li>• Perfect your strategy in solo mode.</li>
          <li>• Choose your game mode to set the winning score.</li>
          <li>• Try to reach your personal best score.</li>
        </>
      )}
    </ul>
  </div>
  <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-4 text-center">
    <p className="text-amber-200 text-sm font-semibold">Game Objective</p>
    <p className="text-stone-300 text-xs mt-1">
      {playMode === 'multiplayer'
        ? 'Roll dice to score points, bank them before you Farkle, and be the first to reach the target score.'
        : 'Roll dice to score points, bank them before you Farkle, and reach the target score to win!'}
    </p>
  </div>
  <div className="mt-auto text-center text-xs text-stone-400">
    <p>
      {playMode === 'multiplayer'
        ? 'No installs required — just share the lobby code and start playing.'
        : 'Jump right in and test your luck!'}
    </p>
  </div>
</aside>
```

e. **Update button text** (line 117-123):
```typescript
<button
  type="submit"
  disabled={!nickname.trim()}
  className="..."
>
  {playMode === 'singleplayer'
    ? 'Play Solo'
    : lobbyCode ? 'Join Lobby' : 'Create Lobby'}
</button>
```

f. **Update props interface and form submission** (lines 4-9, 16-21):
```typescript
interface LobbyCreationScreenProps {
  onCreateOrJoin: (nickname: string, avatar: number, lobbyCode?: string, playMode?: 'singleplayer' | 'multiplayer') => void;
  error?: string;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (nickname.trim()) {
    onCreateOrJoin(
      nickname.trim(),
      selectedAvatar,
      playMode === 'multiplayer' ? (lobbyCode.trim() || undefined) : undefined,
      playMode
    );
  }
};
```

**Files modified**:
- `components/LobbyCreationScreen.tsx`

---

### 2. Create SingleplayerLobbyScreen Component

**New file**: `components/SingleplayerLobbyScreen.tsx`

This intermediate screen allows singleplayer users to select game mode before starting (mirrors the multiplayer lobby experience).

```typescript
import React, { useState } from 'react';
import { GameMode, Player } from '../types';
import { GAME_MODES } from '../constants';
import SoundToggle from './SoundToggle';

interface SingleplayerLobbyScreenProps {
  player: Player;
  onStartGame: (gameMode: GameMode) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const SingleplayerLobbyScreen: React.FC<SingleplayerLobbyScreenProps> = ({
  player,
  onStartGame,
  soundEnabled,
  toggleSound,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('standard');

  return (
    <div className="min-h-screen bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex items-center justify-center px-3 py-4 lg:px-6 lg:py-6 overflow-y-auto lg:overflow-hidden">
      <div className="w-full max-w-3xl mx-auto bg-stone-800/60 backdrop-blur-sm shadow-2xl rounded-xl border-4 border-amber-800 p-4 sm:p-6 lg:p-7 flex flex-col gap-6">
        <header className="text-center relative">
          <div className="absolute top-0 right-0">
            <SoundToggle soundEnabled={soundEnabled} toggleSound={toggleSound} />
          </div>
          <h1 className="text-4xl font-bold text-amber-300 tracking-[0.35em] mb-1">FARKLE</h1>
          <p className="text-amber-200 text-sm sm:text-base">Solo Play</p>
        </header>

        <div className="bg-stone-900/70 border-4 border-amber-700 rounded-lg p-4 sm:p-5 flex items-center gap-4 justify-center">
          <div className="bg-stone-900 border-4 border-amber-600 rounded-lg p-2">
            <img
              src={`/images/farkle-avatar-${player.avatar}.png`}
              alt={`${player.nickname}'s avatar`}
              className="w-16 h-16 object-cover rounded-lg"
            />
          </div>
          <div>
            <p className="text-amber-200 text-xl font-bold">{player.nickname}</p>
            <p className="text-stone-400 text-sm">Ready to play!</p>
          </div>
        </div>

        <div className="bg-stone-900/70 border-4 border-amber-700 rounded-lg p-4 sm:p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-amber-200 font-semibold text-center mb-3">Choose Game Mode</h3>
            <div className="flex flex-col gap-2">
              {(Object.keys(GAME_MODES) as GameMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setGameMode(mode)}
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                    gameMode === mode
                      ? 'bg-amber-600 text-stone-900 shadow-md scale-105'
                      : 'bg-stone-700/50 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{GAME_MODES[mode].label}</span>
                    <span className="text-xs opacity-80">Target: {GAME_MODES[mode].winningScore} pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStartGame(gameMode)}
            className="w-full bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold py-3 px-5 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Start Game
          </button>
        </div>

        <div className="bg-stone-900/70 border border-amber-700 rounded-lg p-4 text-xs text-stone-200">
          <h3 className="text-amber-200 font-semibold mb-2 text-center text-sm">Quick Rules</h3>
          <ul className="list-disc list-inside space-y-1 leading-tight">
            <li>Take turns rolling to collect scoring dice.</li>
            <li>1s = 100 points, 5s = 50 points.</li>
            <li>Three of a kind scores face value × 100 (1s = 1000).</li>
            <li>Bank points before you Farkle with no scorers.</li>
            <li>Reach {GAME_MODES[gameMode].winningScore} points to win!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SingleplayerLobbyScreen;
```

**Files created**:
- `components/SingleplayerLobbyScreen.tsx`

---

### 3. Refactor App.tsx

**Changes needed**:

a. **Add new imports** (lines 1-8):
```typescript
import { useFarkleGame } from './hooks/useFarkleGame';
import SingleplayerLobbyScreen from './components/SingleplayerLobbyScreen';
```

b. **Add mode state to App component** (line 14):
```typescript
const App: React.FC = () => {
  const [playMode, setPlayMode] = useState<'singleplayer' | 'multiplayer'>('multiplayer');

  return playMode === 'multiplayer'
    ? <MultiplayerApp setPlayMode={setPlayMode} />
    : <SingleplayerApp setPlayMode={setPlayMode} />;
};
```

c. **Extract current App logic into MultiplayerApp**:
```typescript
const MultiplayerApp: React.FC<{ setPlayMode: (mode: 'singleplayer' | 'multiplayer') => void }> = ({ setPlayMode }) => {
  // All existing useMultiplayerGame hook code (lines 15-33)
  const {
    screen,
    error,
    lobbyCode,
    isHost,
    players,
    createOrJoinLobby,
    startGame,
    gameState,
    gameMode,
    rollDice,
    selectDie,
    keepDice,
    bankScore,
    handleFarkle,
    getCurrentPlayer,
    isMyTurn,
    winner,
  } = useMultiplayerGame();

  // All existing useAudioManager code and game logic (lines 35-408)
  // ...

  // Update LobbyCreationScreen call (line 105):
  if (screen === Screen.LobbyCreation) {
    return (
      <LobbyCreationScreen
        onCreateOrJoin={(nickname, avatar, code, mode) => {
          if (mode === 'singleplayer') {
            setPlayMode('singleplayer');
          } else {
            createOrJoinLobby(nickname, avatar, code);
          }
        }}
        error={error}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />
    );
  }

  // Rest of existing multiplayer rendering code...
};
```

d. **Create new SingleplayerApp component**:
```typescript
const SingleplayerApp: React.FC<{ setPlayMode: (mode: 'singleplayer' | 'multiplayer') => void }> = ({ setPlayMode }) => {
  const [screen, setScreen] = useState<Screen>(Screen.LobbyCreation);
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [playerInfo, setPlayerInfo] = useState<{ nickname: string; avatar: number } | null>(null);

  const singleplayerGame = useFarkleGame({
    winningScore: GAME_MODES[gameMode].winningScore,
  });

  const { playMusic, startTavernMusic, stopAllMusic, playSoundEffect, soundEnabled, toggleSound } = useAudioManager();

  const dice = singleplayerGame.dice;
  const keptDice = singleplayerGame.keptDice;
  const turnScore = singleplayerGame.turnScore;
  const totalScore = singleplayerGame.totalScore;
  const gameStatus = singleplayerGame.gameStatus;

  const [infoTab, setInfoTab] = useState<'scoreboard' | 'help'>('scoreboard');

  // Compute values (similar to multiplayer)
  const selectedDice = useMemo(() => dice.filter(d => d.isSelected), [dice]);
  const unselectedDice = useMemo(() => dice.filter(d => !d.isSelected), [dice]);
  const scoreForSelection = useMemo(() => calculateScore(selectedDice.map(d => d.value)), [selectedDice]);
  const scoringExamples = useMemo(/* same as multiplayer */, []);

  // Music management
  useEffect(() => {
    if (screen === Screen.LobbyCreation || screen === Screen.Lobby) {
      playMusic('lobby');
    } else if (screen === Screen.Game) {
      startTavernMusic();
    }
  }, [screen, playMusic, startTavernMusic]);

  useEffect(() => {
    if (gameStatus === GameStatus.GameOverWin) {
      playMusic('ending');
    }
  }, [gameStatus, playMusic]);

  useEffect(() => {
    if (gameStatus === GameStatus.DiceRolled && dice.length > 0 && checkForFarkle(dice.map(d => d.value))) {
      playSoundEffect('farkled');
    }
  }, [gameStatus, dice, playSoundEffect]);

  // Screen: Lobby Creation
  if (screen === Screen.LobbyCreation) {
    return (
      <LobbyCreationScreen
        onCreateOrJoin={(nickname, avatar, _code, mode) => {
          if (mode === 'multiplayer') {
            setPlayMode('multiplayer');
          } else {
            setPlayerInfo({ nickname, avatar });
            setScreen(Screen.Lobby);
          }
        }}
        error={undefined}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />
    );
  }

  // Screen: Singleplayer Lobby (mode selection)
  if (screen === Screen.Lobby && playerInfo) {
    const player: Player = {
      id: 'sp-player',
      nickname: playerInfo.nickname,
      avatar: playerInfo.avatar,
      score: totalScore,
      isReady: true,
    };

    return (
      <SingleplayerLobbyScreen
        player={player}
        onStartGame={(mode) => {
          setGameMode(mode);
          singleplayerGame.handleNewGame();
          setScreen(Screen.Game);
        }}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />
    );
  }

  // Screen: Game (full implementation with dice rendering, modals, etc.)
  // ... (see detailed plan for complete implementation)
};
```

**Files modified**:
- `App.tsx`

---

### 4. Update useFarkleGame Hook

**File**: `hooks/useFarkleGame.ts`

**Changes**:

a. Update interface (line 15):
```typescript
interface UseFarkleGameProps {
    onDiceRoll?: () => void;
    onFarkle?: () => void;
    onWin?: () => void;
    winningScore?: number;  // ADD THIS
}
```

b. Use dynamic winning score (lines 21, 67, 121):
```typescript
export const useFarkleGame = (props?: UseFarkleGameProps) => {
    const { onDiceRoll, onFarkle, onWin, winningScore = WINNING_SCORE } = props || {};
    // ...

    const handleFarkleAck = useCallback(() => {
        if (totalScore >= winningScore) {  // CHANGE FROM WINNING_SCORE
            setGameStatus(GameStatus.GameOverWin);
        } else {
            startTurn();
        }
    }, [startTurn, totalScore, winningScore]);  // ADD winningScore TO DEPS

    const handleBankScore = useCallback(() => {
        // ...
        const newTotalScore = totalScore + finalTurnScore;
        setTotalScore(newTotalScore);
        if (newTotalScore >= winningScore) {  // CHANGE FROM WINNING_SCORE
            setGameStatus(GameStatus.GameOverWin);
            onWin?.();
        } else {
            startTurn();
        }
    }, [totalScore, turnScore, startTurn, gameStatus, dice, onWin, winningScore]);  // ADD winningScore
};
```

**Files modified**:
- `hooks/useFarkleGame.ts`

---

### 5. Add TypeScript Type

**File**: `types.ts`

Add new type for play mode:
```typescript
export type PlayMode = 'singleplayer' | 'multiplayer';
```

**Files modified**:
- `types.ts`

---

## Summary of Changes

### Files to Modify
1. **components/LobbyCreationScreen.tsx** - Add mode toggle, conditional lobby code, adaptive text
2. **App.tsx** - Split into MultiplayerApp and SingleplayerApp, add mode state
3. **hooks/useFarkleGame.ts** - Support dynamic winning scores for game modes
4. **types.ts** - Add PlayMode type

### Files to Create
5. **components/SingleplayerLobbyScreen.tsx** - New singleplayer lobby with game mode selection

### Key Features
- ✅ Toggle between singleplayer/multiplayer in lobby creation
- ✅ Lobby code field disabled in singleplayer mode
- ✅ Adaptive text in Quick Tips, Game Objective, and footer
- ✅ Button text changes based on mode
- ✅ Singleplayer flow: LobbyCreation → SingleplayerLobby → Game
- ✅ Game mode selection (rush/standard/marathon) in singleplayer lobby
- ✅ Full singleplayer game functionality using useFarkleGame hook
- ✅ Music and sound effects work in both modes
- ✅ Winner and farkle modals adapted for singleplayer

### Testing Checklist
- [ ] Toggle switches between modes correctly
- [ ] Lobby code field is disabled in singleplayer
- [ ] Text updates based on selected mode
- [ ] Singleplayer: Can create game, select mode, play, and win
- [ ] Multiplayer: Unchanged behavior (no regressions)
- [ ] Music plays correctly in both modes
- [ ] Sound effects work in both modes
- [ ] Mobile responsive on all new screens
- [ ] TypeScript compiles without errors
