<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Farkle - Multiplayer Dice Game

A real-time multiplayer dice game built with React, TypeScript, Socket.io, and Express. Farkle is a classic dice game where players roll dice, score points based on combinations, and compete to reach the winning score first.

## What is Farkle?

Farkle is a fun, fast-paced dice game where players take turns rolling six dice and scoring points based on specific combinations. The goal is to be the first player to reach the winning score (varies by game mode). Players must balance risk and reward - keep rolling to increase your turn score or bank your points before you "Farkle" (roll with no scoring dice) and lose everything!

## Game Features

### Multiplayer Mode (Default)
The game is built for **multiplayer by default**, supporting 2-4 players in real-time competitive matches:
- Create or join lobbies with 6-letter codes
- Real-time gameplay with WebSocket communication
- Multiple game modes: Rush (1000 pts), Standard (2000 pts), Marathon (4000 pts)
- Live scoreboard and turn tracking
- Immersive audio with tavern music and sound effects
- Avatar selection and player customization

### Single Player Mode (Available via useFarkleGame.ts)
While multiplayer is the default experience, the game includes a single-player hook (`hooks/useFarkleGame.ts`) for solo gameplay. The multiplayer version uses `hooks/useMultiplayerGame.ts` as the default game hook.

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
- **Socket.io Client** for real-time communication
- Custom hooks for game logic and audio management

### Backend
- **Express 5** server
- **Socket.io** for WebSocket connections
- **In-memory database** using JavaScript Map objects (see Database section below)

### Key Hooks

#### useMultiplayerGame.ts (Default)
The primary game hook for multiplayer functionality. Handles:
- Socket.io connection management
- Lobby creation and joining
- Real-time game state synchronization
- Player actions (roll, select, keep, bank)
- Turn management and winner detection

#### useFarkleGame.ts (Single Player)
Alternative hook for single-player gameplay. Handles:
- Local game state management
- Dice rolling and scoring logic
- Turn management for solo play
- Game status tracking (not started, player turn, farkled, won)

#### useAudioManager.ts
Manages all game audio including:
- Background tavern music (alternates between two tracks)
- Lobby music
- Sound effects (dice roll, farkle, ending)
- Sound toggle functionality

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

### 2. Start the Backend Server
In one terminal:
```bash
npm run server
```
This starts the Socket.io server on port 3001 (or PORT environment variable).

### 3. Start the Frontend
In another terminal:
```bash
npm run dev
```
This starts the Vite dev server on port 5173.

### 4. Play the Game

**Creating a Lobby:**
1. Open http://localhost:5173
2. Enter your nickname and select an avatar
3. Leave the lobby code empty
4. Click "Create Lobby"
5. Share the 6-letter code with friends

**Joining a Lobby:**
1. Open http://localhost:5173 in a new tab/window
2. Enter your nickname and select an avatar
3. Enter the 6-letter lobby code
4. Click "Join Lobby"

**Starting the Game:**
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
│   ├── LobbyCreationScreen.tsx
│   ├── LobbyScreen.tsx
│   ├── Modal.tsx
│   └── SoundToggle.tsx
├── hooks/              # Custom React hooks
│   ├── useMultiplayerGame.ts  # Default multiplayer hook
│   ├── useFarkleGame.ts       # Single-player hook
│   └── useAudioManager.ts     # Audio management
├── utils/              # Utility functions
│   └── scoring.ts      # Dice scoring logic
├── types.ts            # TypeScript type definitions
├── constants.ts        # Game constants and modes
├── App.tsx            # Main game component
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
