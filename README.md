# Farkle - Dice Game

A real-time multiplayer and singleplayer dice game built with React, TypeScript, Socket.io, and Express. Farkle is a classic dice game where players roll dice, score points based on combinations, and compete to reach the winning score first.

## What is Farkle?

Farkle is a fun, fast-paced dice game where players take turns rolling six dice and scoring points based on specific combinations. The goal is to be the first player to reach the winning score (varies by game mode). Players must balance risk and reward - keep rolling to increase your turn score or bank your points before you "Farkle" (roll with no scoring dice) and lose everything!

## Game Features

Play **Solo** or **Multiplayer** - choose your mode right from the lobby creation screen!

### Singleplayer Mode
Perfect your strategy and practice solo:
- Select from three game modes: Rush (1000 pts), Standard (2000 pts), Marathon (4000 pts)
- Track your personal best scores
- Same core gameplay mechanics as multiplayer
- Full audio experience with tavern music and sound effects
- Avatar selection and customization

### Multiplayer Mode
Compete with 2-4 players in real-time matches:
- Create or join lobbies with 6-letter codes
- Real-time gameplay with WebSocket communication
- Host selects game mode for the entire lobby
- Live scoreboard and turn tracking
- Immersive audio with tavern music and sound effects
- Avatar selection and player customization

### Unified Experience
- **Mode Toggle**: Switch between Solo and Multiplayer modes from the lobby creation screen
- **Seamless Transition**: No code changes needed - just select your preferred mode
- **Consistent UI**: Same polished interface across both modes

## Game Rules

Players take turns rolling 6 dice and scoring points:

**Scoring Combinations:**
- **1s** = 100 points each
- **5s** = 50 points each
- **Three of a kind** = Face value × 100 (except three 1s = 1000)
- **Straight (1-2-3-4-5-6)** = 1500 points

**Gameplay:**
1. Roll all 6 dice
2. Select scoring dice and keep them
3. Roll remaining dice again to score more, or bank your turn score
4. **Farkle**: If you roll and get no scoring dice, you lose your entire turn score
5. **Hot Dice**: If you use all 6 dice for scoring, you get to roll all 6 again
6. First player to reach the winning score wins!

## Architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Socket.io Client** for real-time multiplayer communication
- **Mode Routing**: App component switches between `MultiplayerApp` and `SingleplayerApp` based on user selection
- Custom hooks for game logic and audio management

### Backend
- **Express 5** server
- **Socket.io** for WebSocket connections (multiplayer only)
- **In-memory database** using JavaScript Map objects (see Database section below)

### Key Components

#### App.tsx
Main application component that:
- Manages play mode state (singleplayer vs multiplayer)
- Routes to `MultiplayerApp` or `SingleplayerApp` components
- Preserves player info when switching modes

#### MultiplayerApp
Handles all multiplayer game flow:
- Uses `useMultiplayerGame` hook for Socket.io-based gameplay
- Manages lobby creation/joining screens
- Real-time game state synchronization
- Multiplayer scoreboard and turn management

#### SingleplayerApp
Handles all singleplayer game flow:
- Uses `useFarkleGame` hook for local gameplay
- Game mode selection screen
- Local game state management
- Single player scoreboard

### Key Hooks

#### useMultiplayerGame.ts
The multiplayer game hook. Handles:
- Socket.io connection management
- Lobby creation and joining
- Real-time game state synchronization
- Player actions (roll, select, keep, bank)
- Turn management and winner detection

#### useFarkleGame.ts
The singleplayer game hook. Handles:
- Local game state management
- Dice rolling and scoring logic
- Turn management for solo play
- Dynamic winning scores based on game mode
- Game status tracking (not started, player turn, farkled, won)

#### useAudioManager.ts
Manages all game audio including:
- Background tavern music (alternates between two tracks)
- Lobby music
- Sound effects (dice roll, farkle, ending)
- Sound toggle functionality

## Soundtrack
I took the liberty of taking two soundtracks from the hit RPG Kingdom Come: Deliverance as I found out about Farkle thanks to KCD and the music is befitting. There is also an SFX from Age of Empires II. Needless to say, any commercial use of this repo would have to replace the music here.

## Database Structure

The game uses an **in-memory database** (no persistent storage) with two primary Map structures:

### Lobbies Map
Stores all active lobbies by lobby code:

```javascript
lobbies = Map<string, Lobby>

// Lobby structure:
{
  code: string,              // 6-letter alphanumeric code (e.g., "ABC123")
  host: string,              // Socket ID of the lobby host
  players: Player[],         // Array of 0-4 players
  gameState: MultiplayerGameState | null,  // Current game state
  isGameStarted: boolean,    // Whether the game is in progress
  gameMode: 'rush' | 'standard' | 'marathon'  // Selected game mode
}

// Player structure:
{
  id: string,                // Socket ID
  nickname: string,          // Player's chosen nickname
  avatar: number,            // Avatar ID (1-5)
  score: number,             // Current total score
  isReady: boolean           // Ready status (future feature)
}

// MultiplayerGameState structure:
{
  currentPlayerIndex: number,     // Index of current player in players array
  currentPlayerTurn: string,      // Socket ID of current player
  dice: Die[],                    // Current roll dice
  keptDice: Die[],                // Dice kept this turn
  turnScore: number,              // Points scored in current turn
  gameStatus: string              // 'PLAYER_TURN' | 'DICE_ROLLED'
}
```

### PlayerToLobby Map
Maps socket IDs to lobby codes for quick player lookup:

```javascript
playerToLobby = Map<string, string>  // socketId -> lobbyCode
```

### Database Behavior
- **Volatile**: All data is lost when the server restarts
- **No persistence**: Refreshing the page disconnects players from lobbies
- **Host disconnect**: If the lobby host disconnects, the entire lobby is destroyed
- **Auto-cleanup**: Empty lobbies are automatically deleted

### Database Operations
The server performs these key operations:

1. **Lobby Creation**: Generate unique 6-letter code → Create new lobby entry
2. **Player Join**: Add player to lobby → Update playerToLobby map
3. **Game Start**: Initialize gameState with dice and turn tracking
4. **Game Actions**: Update dice arrays, scores, and turn management
5. **Disconnect Handling**: Remove player → Delete lobby if empty or host disconnected

## Run Locally

**Prerequisites:** Node.js

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server (Required for Multiplayer Only)
In one terminal:
```bash
npm run server
```
This starts the Socket.io server on port 3001 (or PORT environment variable).

**Note:** Skip this step if you only want to play singleplayer mode.

### 3. Start the Frontend
In another terminal:
```bash
npm run dev
```
This starts the Vite dev server on port 5173.

### 4. Play the Game

**Singleplayer:**
1. Open http://localhost:5173
2. Enter your nickname and select an avatar
3. Toggle to **Solo** mode
4. Click "Play Solo"
5. Select your game mode: Rush (1000), Standard (2000), or Marathon (4000)
6. Click "Start Game" and play!

**Multiplayer - Creating a Lobby:**
1. Open http://localhost:5173
2. Enter your nickname and select an avatar
3. Toggle to **Multiplayer** mode (default)
4. Leave the lobby code empty
5. Click "Create Lobby"
6. Share the 6-letter code with friends

**Multiplayer - Joining a Lobby:**
1. Open http://localhost:5173 in a new tab/window
2. Enter your nickname and select an avatar
3. Toggle to **Multiplayer** mode (default)
4. Enter the 6-letter lobby code
5. Click "Join Lobby"

**Multiplayer - Starting the Game:**
- Wait for at least 2 players (up to 4 players)
- Host selects a game mode: Rush (1000), Standard (2000), or Marathon (4000)
- Host clicks "Start Game"

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Environment Variables

### Frontend
- `VITE_SERVER_URL` - Socket.io server URL (default: http://localhost:3001)

### Backend
- `PORT` - Server port (default: 3001)
- `ALLOWED_ORIGINS` - Comma-separated CORS origins (default: localhost:5173,localhost:3000,localhost:3002)

## Important Notes

### Singleplayer
- **No Server Required**: Singleplayer mode works entirely client-side (no backend needed)
- **No Persistence**: Refreshing the page resets your game
- **Offline Play**: Can be played without internet connection (after initial load)

### Multiplayer
- **Server Required**: Backend server must be running for multiplayer
- **No Persistence**: Refreshing the page disconnects you from the game
- **Host Disconnect**: If the host leaves, all players are kicked out
- **Trusted Environment**: No anti-cheat or validation measures
- **Local Testing**: Open multiple browser tabs to test with multiple players

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express 5, Socket.io
- **Real-time**: WebSocket communication
- **State Management**: Server-authoritative game state
- **Styling**: Custom CSS with Tailwind-like utility classes

## Project Structure

```
farkle/
├── components/          # React components
│   ├── Die.tsx         # Dice rendering component
│   ├── LobbyCreationScreen.tsx  # Unified lobby creation (mode toggle)
│   ├── LobbyScreen.tsx          # Multiplayer lobby screen
│   ├── SingleplayerLobbyScreen.tsx  # Singleplayer game mode selection
│   ├── Modal.tsx
│   └── SoundToggle.tsx
├── hooks/              # Custom React hooks
│   ├── useMultiplayerGame.ts  # Multiplayer game logic
│   ├── useFarkleGame.ts       # Singleplayer game logic
│   └── useAudioManager.ts     # Audio management
├── utils/              # Utility functions
│   └── scoring.ts      # Dice scoring logic
├── types.ts            # TypeScript type definitions
├── constants.ts        # Game constants and modes
├── App.tsx            # Main app with mode routing
├── server.js          # Express + Socket.io server
└── dist/              # Production build output
    ├── audio/         # Game sound effects and music
    └── images/        # Avatar images
```

## Troubleshooting

**Connection Issues:**
- Ensure both server and client are running
- Check that ports 3001 and 5173 are available

**Port Already in Use:**
- Change the port in `server.js` (line 354) for backend
- Update `VITE_SERVER_URL` in `hooks/useMultiplayerGame.ts` (line 6) for frontend

**TypeScript Errors:**
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript version matches `package.json` (~5.8.2)
