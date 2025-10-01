import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);

// CORS configuration - accepts both development and production origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3002', 'http://localhost:3000'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory storage
const lobbies = new Map(); // lobbyCode -> lobby data
const playerToLobby = new Map(); // socketId -> lobbyCode

// Game mode configurations
const GAME_MODES = {
  rush: { label: 'Rush', winningScore: 1000 },
  standard: { label: 'Standard', winningScore: 2000 },
  marathon: { label: 'Marathon', winningScore: 4000 },
};

function getWinningScore(gameMode) {
  return GAME_MODES[gameMode]?.winningScore || 2000;
}

// Generate 6-letter alphanumeric code
function generateLobbyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create unique lobby code
function createLobbyCode() {
  let code;
  do {
    code = generateLobbyCode();
  } while (lobbies.has(code));
  return code;
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create or join lobby
  socket.on('createOrJoinLobby', ({ nickname, avatar, lobbyCode }) => {
    let code = lobbyCode?.toUpperCase();
    let isNewLobby = false;

    // If no code provided, create new lobby
    if (!code) {
      code = createLobbyCode();
      isNewLobby = true;
      lobbies.set(code, {
        code,
        host: socket.id,
        players: [],
        gameState: null,
        isGameStarted: false,
        gameMode: 'standard'
      });
    }

    // Check if lobby exists
    const lobby = lobbies.get(code);
    if (!lobby) {
      socket.emit('lobbyError', { message: 'Lobby not found' });
      return;
    }

    // Check if lobby is full
    if (lobby.players.length >= 4) {
      socket.emit('lobbyError', { message: 'Lobby is full' });
      return;
    }

    // Check if game already started
    if (lobby.isGameStarted) {
      socket.emit('lobbyError', { message: 'Game already in progress' });
      return;
    }

    // Add player to lobby
    const player = {
      id: socket.id,
      nickname,
      avatar,
      score: 0,
      isReady: false
    };

    lobby.players.push(player);
    playerToLobby.set(socket.id, code);
    socket.join(code);

    // Emit lobby joined event
    socket.emit('lobbyJoined', {
      code,
      isHost: socket.id === lobby.host,
      isNewLobby
    });

    // Broadcast updated lobby state to all players
    io.to(code).emit('lobbyUpdate', {
      players: lobby.players,
      host: lobby.host
    });

    console.log(`Player ${nickname} joined lobby ${code}`);
  });

  // Start game
  socket.on('startGame', ({ gameMode }) => {
    const code = playerToLobby.get(socket.id);
    const lobby = lobbies.get(code);

    if (!lobby) return;

    // Only host can start game
    if (socket.id !== lobby.host) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }

    // Need at least 2 players
    if (lobby.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }

    // Set game mode
    if (gameMode) {
      lobby.gameMode = gameMode;
    }

    // Initialize game state
    lobby.isGameStarted = true;
    lobby.gameState = {
      currentPlayerIndex: 0,
      currentPlayerTurn: lobby.players[0].id,
      dice: [],
      keptDice: [],
      turnScore: 0,
      gameStatus: 'PLAYER_TURN'
    };

    // Notify all players that game is starting
    io.to(code).emit('gameStarted', {
      players: lobby.players,
      gameState: lobby.gameState,
      gameMode: lobby.gameMode
    });

    console.log(`Game started in lobby ${code} with mode ${lobby.gameMode}`);
  });

  // Handle game actions
  socket.on('rollDice', () => {
    const code = playerToLobby.get(socket.id);
    const lobby = lobbies.get(code);

    if (!lobby || !lobby.isGameStarted) return;
    if (lobby.gameState.currentPlayerTurn !== socket.id) return;

    // Roll dice
    const numToRoll = lobby.gameState.dice.length === 0 ? 6 : lobby.gameState.dice.length;
    const newDice = Array.from({ length: numToRoll }, (_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 6) + 1,
      isSelected: false
    }));

    lobby.gameState.dice = newDice;
    lobby.gameState.gameStatus = 'DICE_ROLLED';

    io.to(code).emit('gameUpdate', lobby.gameState);
  });

  socket.on('selectDie', ({ dieId }) => {
    const code = playerToLobby.get(socket.id);
    const lobby = lobbies.get(code);

    if (!lobby || !lobby.isGameStarted) return;
    if (lobby.gameState.currentPlayerTurn !== socket.id) return;

    // Toggle die selection
    lobby.gameState.dice = lobby.gameState.dice.map(d =>
      d.id === dieId ? { ...d, isSelected: !d.isSelected } : d
    );

    io.to(code).emit('gameUpdate', lobby.gameState);
  });

  socket.on('keepDice', ({ score }) => {
    const code = playerToLobby.get(socket.id);
    const lobby = lobbies.get(code);

    if (!lobby || !lobby.isGameStarted) return;
    if (lobby.gameState.currentPlayerTurn !== socket.id) return;

    // Move selected dice to kept
    const selectedDice = lobby.gameState.dice.filter(d => d.isSelected);
    const remainingDice = lobby.gameState.dice.filter(d => !d.isSelected);

    lobby.gameState.keptDice = [...lobby.gameState.keptDice, ...selectedDice.map(d => ({ ...d, isSelected: false }))];
    lobby.gameState.turnScore += score;

    // Hot dice - if all 6 dice are kept, reset for new roll
    if (lobby.gameState.keptDice.length === 6) {
      lobby.gameState.dice = Array.from({ length: 6 }, (_, i) => ({ id: i, value: 1, isSelected: false }));
      lobby.gameState.keptDice = [];
    } else {
      lobby.gameState.dice = remainingDice;
    }

    lobby.gameState.gameStatus = 'PLAYER_TURN';

    io.to(code).emit('gameUpdate', lobby.gameState);
  });

  socket.on('bankScore', ({ finalScore }) => {
    const code = playerToLobby.get(socket.id);
    const lobby = lobbies.get(code);

    if (!lobby || !lobby.isGameStarted) return;
    if (lobby.gameState.currentPlayerTurn !== socket.id) return;

    // Add score to player
    const player = lobby.players.find(p => p.id === socket.id);
    if (player) {
      player.score += finalScore;
    }

    // Check for winner using dynamic winning score
    const winningScore = getWinningScore(lobby.gameMode);
    if (player.score >= winningScore) {
      io.to(code).emit('gameOver', {
        winner: player,
        players: lobby.players
      });
      lobby.isGameStarted = false;
      return;
    }

    // Move to next player
    lobby.gameState.currentPlayerIndex = (lobby.gameState.currentPlayerIndex + 1) % lobby.players.length;
    lobby.gameState.currentPlayerTurn = lobby.players[lobby.gameState.currentPlayerIndex].id;
    lobby.gameState.dice = [];
    lobby.gameState.keptDice = [];
    lobby.gameState.turnScore = 0;
    lobby.gameState.gameStatus = 'PLAYER_TURN';

    io.to(code).emit('turnChanged', {
      currentPlayerTurn: lobby.gameState.currentPlayerTurn,
      players: lobby.players
    });

    io.to(code).emit('gameUpdate', lobby.gameState);
  });

  socket.on('farkle', () => {
    const code = playerToLobby.get(socket.id);
    const lobby = lobbies.get(code);

    if (!lobby || !lobby.isGameStarted) return;
    if (lobby.gameState.currentPlayerTurn !== socket.id) return;

    // Move to next player
    lobby.gameState.currentPlayerIndex = (lobby.gameState.currentPlayerIndex + 1) % lobby.players.length;
    lobby.gameState.currentPlayerTurn = lobby.players[lobby.gameState.currentPlayerIndex].id;
    lobby.gameState.dice = [];
    lobby.gameState.keptDice = [];
    lobby.gameState.turnScore = 0;
    lobby.gameState.gameStatus = 'PLAYER_TURN';

    io.to(code).emit('turnChanged', {
      currentPlayerTurn: lobby.gameState.currentPlayerTurn,
      players: lobby.players
    });

    io.to(code).emit('gameUpdate', lobby.gameState);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    const code = playerToLobby.get(socket.id);
    if (!code) return;

    const lobby = lobbies.get(code);
    if (!lobby) return;

    // If host disconnects, everyone drops out
    if (socket.id === lobby.host) {
      io.to(code).emit('hostDisconnected');
      lobbies.delete(code);
      lobby.players.forEach(p => playerToLobby.delete(p.id));
      console.log(`Host disconnected, lobby ${code} deleted`);
      return;
    }

    // Remove player from lobby
    lobby.players = lobby.players.filter(p => p.id !== socket.id);
    playerToLobby.delete(socket.id);

    // If game was in progress and it's this player's turn, move to next
    if (lobby.isGameStarted && lobby.gameState.currentPlayerTurn === socket.id) {
      if (lobby.players.length > 0) {
        lobby.gameState.currentPlayerIndex = lobby.gameState.currentPlayerIndex % lobby.players.length;
        lobby.gameState.currentPlayerTurn = lobby.players[lobby.gameState.currentPlayerIndex].id;
        io.to(code).emit('turnChanged', {
          currentPlayerTurn: lobby.gameState.currentPlayerTurn,
          players: lobby.players
        });
      }
    }

    // Notify remaining players
    io.to(code).emit('playerLeft', {
      playerId: socket.id,
      players: lobby.players
    });

    io.to(code).emit('lobbyUpdate', {
      players: lobby.players,
      host: lobby.host
    });

    // If no players left, delete lobby
    if (lobby.players.length === 0) {
      lobbies.delete(code);
      console.log(`Lobby ${code} is empty, deleted`);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});