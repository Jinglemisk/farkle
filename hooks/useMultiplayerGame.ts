import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player, MultiplayerGameState, Screen } from '../types';

// Use environment variable for server URL, fallback to localhost for development
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const useMultiplayerGame = () => {
  const [screen, setScreen] = useState<Screen>(Screen.LobbyCreation);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string>('');

  // Lobby state
  const [lobbyCode, setLobbyCode] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerNickname, setCurrentPlayerNickname] = useState<string>('');

  // Game state
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SERVER_URL);
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('lobbyJoined', ({ code, isHost: host, isNewLobby }) => {
      setLobbyCode(code);
      setIsHost(host);
      setScreen(Screen.Lobby);
      setError('');
    });

    newSocket.on('lobbyError', ({ message }) => {
      setError(message);
    });

    newSocket.on('lobbyUpdate', ({ players: updatedPlayers, host }) => {
      setPlayers(updatedPlayers);
      setIsHost(newSocket.id === host);
    });

    newSocket.on('gameStarted', ({ players: updatedPlayers, gameState: newGameState }) => {
      setPlayers(updatedPlayers);
      setGameState(newGameState);
      setScreen(Screen.Game);
    });

    newSocket.on('gameUpdate', (newGameState: MultiplayerGameState) => {
      setGameState(newGameState);
    });

    newSocket.on('turnChanged', ({ currentPlayerTurn, players: updatedPlayers }) => {
      setPlayers(updatedPlayers);
      setGameState(prev => prev ? { ...prev, currentPlayerTurn } : null);
    });

    newSocket.on('gameOver', ({ winner: gameWinner, players: finalPlayers }) => {
      setWinner(gameWinner);
      setPlayers(finalPlayers);
    });

    newSocket.on('hostDisconnected', () => {
      alert('Host disconnected. Returning to lobby creation.');
      resetToLobbyCreation();
    });

    newSocket.on('playerLeft', ({ playerId, players: updatedPlayers }) => {
      setPlayers(updatedPlayers);
    });

    newSocket.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const resetToLobbyCreation = useCallback(() => {
    setScreen(Screen.LobbyCreation);
    setLobbyCode('');
    setIsHost(false);
    setPlayers([]);
    setGameState(null);
    setWinner(null);
    setError('');
  }, []);

  const createOrJoinLobby = useCallback((nickname: string, code?: string) => {
    if (!socket) return;

    setCurrentPlayerNickname(nickname);
    socket.emit('createOrJoinLobby', { nickname, lobbyCode: code });
  }, [socket]);

  const startGame = useCallback(() => {
    if (!socket) return;
    socket.emit('startGame');
  }, [socket]);

  const rollDice = useCallback(() => {
    if (!socket) return;
    socket.emit('rollDice');
  }, [socket]);

  const selectDie = useCallback((dieId: number) => {
    if (!socket) return;
    socket.emit('selectDie', { dieId });
  }, [socket]);

  const keepDice = useCallback((score: number) => {
    if (!socket) return;
    socket.emit('keepDice', { score });
  }, [socket]);

  const bankScore = useCallback((finalScore: number) => {
    if (!socket) return;
    socket.emit('bankScore', { finalScore });
  }, [socket]);

  const handleFarkle = useCallback(() => {
    if (!socket) return;
    socket.emit('farkle');
  }, [socket]);

  const getCurrentPlayer = useCallback(() => {
    if (!gameState) return null;
    return players.find(p => p.id === gameState.currentPlayerTurn) || null;
  }, [gameState, players]);

  const isMyTurn = useCallback(() => {
    if (!socket || !gameState) return false;
    return gameState.currentPlayerTurn === socket.id;
  }, [socket, gameState]);

  return {
    screen,
    error,

    // Lobby
    lobbyCode,
    isHost,
    players,
    createOrJoinLobby,
    startGame,

    // Game
    gameState,
    currentPlayerNickname,
    rollDice,
    selectDie,
    keepDice,
    bankScore,
    handleFarkle,
    getCurrentPlayer,
    isMyTurn,
    winner,

    // Utility
    resetToLobbyCreation,
  };
};