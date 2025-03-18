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

  // Socket event listeners
  useEffect(() => {
    // Listen for game start event
    socket.on('gameStarted', () => {
      setGameState('game');
    });

    // Listen for updated player list
    socket.on('playerList', (playerList) => {
      setPlayers(playerList);
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off('gameStarted');
      socket.off('playerList');
    };
  }, [socket]);

  // Render appropriate component based on game state
  return (
    <div className="app-container">
      {gameState === 'lobby' ? (
        <Lobby
          socket={socket}
          playerName={playerName}
          setPlayerName={setPlayerName}
          players={players}
          gameMode={gameMode}
          setGameMode={setGameMode}
        />
      ) : (
        <Game
          socket={socket}
          playerName={playerName}
          players={players}
          gameMode={gameMode}
        />
      )}
    </div>
  );
};

export default App; 