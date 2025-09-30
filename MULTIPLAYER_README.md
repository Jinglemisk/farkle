# Farkle Multiplayer Game

A real-time multiplayer dice game supporting 2-4 players.

## How to Run

### 1. Start the Backend Server

In one terminal, run:
```bash
npm run server
```

This will start the Socket.io server on port 3001.

### 2. Start the Frontend

In another terminal, run:
```bash
npm run dev
```

This will start the Vite dev server on port 5173.

## How to Play Multiplayer

### Creating a Lobby
1. Open http://localhost:5173 in your browser
2. Enter your nickname
3. Leave the lobby code empty
4. Click "Create Lobby"
5. Share the 6-letter lobby code with your friends

### Joining a Lobby
1. Open http://localhost:5173 in a new browser tab/window
2. Enter your nickname
3. Enter the 6-letter lobby code
4. Click "Join Lobby"

### Starting the Game
- Wait for at least 2 players (up to 4 players can join)
- The host can click "Start Game" when ready

### Game Rules
- Players take turns rolling 6 dice
- Score points with:
  - 1s = 100 points each
  - 5s = 50 points each
  - Three of a kind = face value × 100 (except three 1s = 1000)
  - Straight (1-2-3-4-5-6) = 1500 points
- Keep scoring dice and roll again, or bank your score
- **Farkle**: If you roll and get no scoring dice, you lose your turn score
- **Hot Dice**: If you use all 6 dice, you get to roll all 6 again!
- First player to reach **500 points** wins!

## Important Notes

- **No Persistence**: If you refresh the page, you'll drop out of the game
- **Host Disconnect**: If the host refreshes or disconnects, all players are kicked out
- The game is designed for trusted players (no anti-cheat measures)
- Open multiple browser tabs to test locally with different players

## Technical Details

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.io
- **Real-time Communication**: WebSocket via Socket.io
- **State Management**: Server-authoritative game state

## Testing Locally

1. Open multiple browser tabs (or use incognito windows)
2. In the first tab, create a lobby and note the code
3. In other tabs, join using the same code
4. Start the game from the first tab (host)
5. Play and enjoy!

## Troubleshooting

- **Connection Issues**: Make sure both the server and client are running
- **Port Already in Use**: Change the port in `server.js` (line 305) and `hooks/useMultiplayerGame.ts` (line 6)
- **TypeScript Errors**: Run `npm install` to ensure all dependencies are installed