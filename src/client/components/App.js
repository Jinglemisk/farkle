/**
 * Main App component
 * Manages the application state and renders appropriate views
 * - Controls switching between Lobby and Game components
 * - Maintains player information
 * - Handles socket event listeners
 */

import React, { useState, useEffect } from 'react';
import Lobby from './Lobby';
import Game from './Game';

const App = ({ socket }) => {
  // Game state
  const [gameState, setGameState] = useState('lobby'); // 'lobby' or 'game'
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameMode, setGameMode] = useState('Sprint'); // Default game mode
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameStarted, setGameStarted] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [reconnecting, setReconnecting] = useState(false);

  // Socket event listeners
  useEffect(() => {
    // Connection event handlers
    const onConnect = () => {
      setIsConnected(true);
      setConnectionError('');
      setReconnecting(false);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectionError = (error) => {
      setConnectionError(error || 'Could not connect to server');
      setIsConnected(false);
    };

    const onReconnecting = () => {
      setReconnecting(true);
    };

    // Game state handlers
    const onGameStart = () => {
      setGameStarted(true);
    };

    const onGameEnd = () => {
      setGameStarted(false);
    };

    // Game state listeners
    const onGameStarted = () => {
      setGameState('game');
    };

    const onPlayerList = (playerList) => {
      setPlayers(playerList);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', () => onConnectionError());
    socket.on('connectionError', onConnectionError);
    socket.on('reconnecting', onReconnecting);
    socket.on('gameStart', onGameStart);
    socket.on('gameEnd', onGameEnd);
    socket.on('gameStarted', onGameStarted);
    socket.on('playerList', onPlayerList);

    // Initial connection state
    setIsConnected(socket.connected);

    // Clean up all event listeners on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectionError);
      socket.off('connectionError', onConnectionError);
      socket.off('reconnecting', onReconnecting);
      socket.off('gameStart', onGameStart);
      socket.off('gameEnd', onGameEnd);
      socket.off('gameStarted', onGameStarted);
      socket.off('playerList', onPlayerList);
    };
  }, [socket]);

  // Show error message if not connected
  if (!isConnected) {
    return (
      <div className="game-container">
        <h1>Lucky Roll Tavern</h1>
        {connectionError ? (
          <div className="error-message">
            <h3>Connection Error</h3>
            <p>{connectionError}</p>
            <p>Please refresh the page to try again.</p>
          </div>
        ) : reconnecting ? (
          <div className="connecting-message">
            <h3>Reconnecting...</h3>
            <p>Attempting to reconnect to the tavern. Please wait...</p>
          </div>
        ) : (
          <div className="error-message">
            <h3>Disconnected</h3>
            <p>Lost connection to the tavern. Please refresh the page to reconnect.</p>
          </div>
        )}
      </div>
    );
  }

  // Render the current game state
  return gameStarted ? (
    <Game socket={socket} />
  ) : (
    <Lobby
      socket={socket}
      playerName={playerName}
      setPlayerName={setPlayerName}
      players={players}
      gameMode={gameMode}
      setGameMode={setGameMode}
    />
  );
};

export default App; 