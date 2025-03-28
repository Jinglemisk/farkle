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
import '../styles/main.css';

const App = ({ socket }) => {
  // Game state
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameMode, setGameMode] = useState('Sprint'); // Default game mode
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameStarted, setGameStarted] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [reconnecting, setReconnecting] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [currentRoll, setCurrentRoll] = useState([]);
  const [selectedDice, setSelectedDice] = useState([]);
  const [preBankedPoints, setPreBankedPoints] = useState(0);
  const [hasHotDice, setHasHotDice] = useState(false);

  // Socket event listeners
  useEffect(() => {
    // Connection event handlers
    const handleConnect = () => {
      console.log('Connected to server');
      setIsConnected(true);
      setConnectionError('');
      setReconnecting(false);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setReconnecting(true);
    };

    const handleReconnect = () => {
      console.log('Reconnected to server');
      setIsConnected(true);
      setReconnecting(false);
    };

    const handleError = (error) => {
      console.error('Connection error:', error);
      setConnectionError(typeof error === 'string' ? error : 'Failed to connect to the server');
    };

    // Game state handlers
    const handleGameState = (state) => {
      console.log('Received game state:', state);
      if (state.players) {
        setPlayers(state.players);
      }
      if (state.gameMode) {
        setGameMode(state.gameMode);
      }
      if (state.gameStarted !== undefined) {
        setGameStarted(state.gameStarted);
      }
      if (state.currentTurn !== undefined) {
        setCurrentTurn(state.currentTurn);
      }
      if (state.currentRoll) {
        setCurrentRoll(state.currentRoll);
      }
      if (state.selectedDice) {
        setSelectedDice(state.selectedDice);
      }
      if (state.preBankedPoints !== undefined) {
        setPreBankedPoints(state.preBankedPoints);
      }
      if (state.hasHotDice !== undefined) {
        setHasHotDice(state.hasHotDice);
      }
    };
    
    const handlePlayerJoined = (data) => {
      console.log('Player joined:', data);
      if (data.players) {
        setPlayers(data.players);
      }
    };

    const handleGameStarted = (data) => {
      console.log('Game started:', data);
      setGameStarted(true);
      if (data.players) {
        setPlayers(data.players);
      }
      if (data.gameMode) {
        setGameMode(data.gameMode);
      }
      if (data.currentTurn !== undefined) {
        setCurrentTurn(data.currentTurn);
      }
      if (data.currentRoll) {
        setCurrentRoll(data.currentRoll);
      }
      if (data.selectedDice) {
        setSelectedDice(data.selectedDice);
      }
      if (data.preBankedPoints !== undefined) {
        setPreBankedPoints(data.preBankedPoints);
      }
      if (data.hasHotDice !== undefined) {
        setHasHotDice(data.hasHotDice);
      }
    };

    const handleDiceRolled = (data) => {
      console.log('Dice rolled:', data);
      if (data.currentRoll) {
        setCurrentRoll(data.currentRoll);
      }
      if (data.hasHotDice !== undefined) {
        setHasHotDice(data.hasHotDice);
      }
    };

    const handleDiceSelected = (data) => {
      console.log('Dice selected:', data);
      if (data.currentRoll) {
        setCurrentRoll(data.currentRoll);
      }
      if (data.selectedDice) {
        setSelectedDice(data.selectedDice);
      }
      if (data.preBankedPoints !== undefined) {
        setPreBankedPoints(data.preBankedPoints);
      }
      if (data.hasHotDice !== undefined) {
        setHasHotDice(data.hasHotDice);
      }
    };

    const handlePointsBanked = (data) => {
      console.log('Points banked:', data);
      if (data.players) {
        setPlayers(data.players);
      }
      if (data.currentTurn !== undefined) {
        setCurrentTurn(data.currentTurn);
      }
      setCurrentRoll([]);
      setSelectedDice([]);
      setPreBankedPoints(0);
      setHasHotDice(false);
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('connect_error', handleError);
    socket.on('error', handleError);
    socket.on('gameState', handleGameState);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('gameStarted', handleGameStarted);
    socket.on('diceRolled', handleDiceRolled);
    socket.on('diceSelected', handleDiceSelected);
    socket.on('pointsBanked', handlePointsBanked);

    // Clean up on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('connect_error', handleError);
      socket.off('error', handleError);
      socket.off('gameState', handleGameState);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('gameStarted', handleGameStarted);
      socket.off('diceRolled', handleDiceRolled);
      socket.off('diceSelected', handleDiceSelected);
      socket.off('pointsBanked', handlePointsBanked);
    };
  }, [socket, gameMode]);

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

  console.log('Rendering App with gameStarted:', gameStarted);

  // Render the current game state
  return gameStarted ? (
    <Game 
      key="game"
      players={players}
      gameMode={gameMode}
      currentTurn={currentTurn}
      currentRoll={currentRoll}
      selectedDice={selectedDice}
      preBankedPoints={preBankedPoints}
      hasHotDice={hasHotDice}
    />
  ) : (
    <Lobby
      key="lobby"
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