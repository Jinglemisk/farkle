/**
 * Game component
 * Main game screen that shows:
 * - Game table with players
 * - Active player's dice
 * - Scoreboard
 * - Game controls (roll, bank, etc.)
 * - Pre-banked points
 * 
 * Handles the core game mechanics:
 * - Dice rolling
 * - Scoring
 * - Turn management
 * - Win conditions
 */

import React, { useState, useEffect, useCallback } from 'react';
import Dice from './Dice';
import Scoreboard from './Scoreboard';
import PlayerView from './PlayerView';
import '../styles/game.css';

const Game = ({ socket, playerName, players, gameMode }) => {
  // Game state
  const [gameData, setGameData] = useState({
    currentPlayer: null,
    dice: [],
    selectedDice: [],
    preBankedPoints: 0,
    currentRoll: [],
    isMyTurn: false,
    roundStarted: false,
    canRoll: false,
    canBank: false,
    hasHotDice: false
  });

  // Memoize event handlers to prevent recreating functions on each render
  const handleGameState = useCallback((state) => {
    setGameData(prev => ({
      ...prev,
      ...state,
      // Determine if it's this player's turn
      isMyTurn: state.currentPlayer && state.currentPlayer.id === socket.id
    }));
  }, [socket.id]);

  // Handler for rolling dice
  const handleRoll = useCallback(() => {
    if (gameData.isMyTurn && gameData.canRoll) {
      socket.emit('rollDice');
    }
  }, [socket, gameData.isMyTurn, gameData.canRoll]);

  // Handler for selecting dice
  const handleSelectDie = useCallback((index) => {
    if (gameData.isMyTurn) {
      socket.emit('selectDie', index);
    }
  }, [socket, gameData.isMyTurn]);

  // Handler for banking points
  const handleBank = useCallback(() => {
    if (gameData.isMyTurn && gameData.canBank) {
      socket.emit('bankPoints');
    }
  }, [socket, gameData.isMyTurn, gameData.canBank]);

  // Listen for game state updates from the server
  useEffect(() => {
    // Register event listener only once
    socket.on('gameState', handleGameState);

    // Clean up on unmount
    return () => {
      socket.off('gameState', handleGameState);
    };
  }, [socket, handleGameState]);

  return (
    <div className="game-container">
      <h1>Farkle - {gameMode} Mode</h1>
      
      {/* Game table with players */}
      <div className="game-table">
        {players.map((player) => (
          <PlayerView 
            key={player.id} 
            player={player} 
            isCurrentPlayer={gameData.currentPlayer && gameData.currentPlayer.id === player.id}
            isLocalPlayer={player.id === socket.id}
          />
        ))}
      </div>
      
      {/* Dice section */}
      <div className="dice-section">
        <h2>Dice</h2>
        <div className="dice-container">
          {gameData.currentRoll.map((die, index) => (
            <Dice 
              key={index} 
              value={die.value} 
              selected={die.selected}
              onClick={() => handleSelectDie(index)}
              disabled={!gameData.isMyTurn || die.locked}
            />
          ))}
        </div>
      </div>
      
      {/* Pre-banked points */}
      <div className="pre-bank-section">
        <h2>Pre-banked Points: {gameData.preBankedPoints}</h2>
        <div className="selected-dice">
          {gameData.selectedDice.map((die, index) => (
            <Dice 
              key={index} 
              value={die.value} 
              selected={true}
              disabled={true}
            />
          ))}
        </div>
      </div>
      
      {/* Game controls */}
      <div className="game-controls">
        <button 
          onClick={handleRoll}
          disabled={!gameData.isMyTurn || !gameData.canRoll}
          className={`game-button ${gameData.isMyTurn && gameData.canRoll ? 'active' : ''}`}
        >
          {gameData.hasHotDice ? "Roll (Hot Dice!)" : "Roll Dice"}
        </button>
        
        <button 
          onClick={handleBank}
          disabled={!gameData.isMyTurn || !gameData.canBank}
          className={`game-button ${gameData.isMyTurn && gameData.canBank ? 'active' : ''}`}
        >
          Bank {gameData.preBankedPoints} Points
        </button>
      </div>
      
      {/* Scoreboard */}
      <Scoreboard players={players} />
      
      {/* Game status message */}
      <div className="game-status">
        {gameData.currentPlayer && (
          <p>
            {gameData.currentPlayer.id === socket.id 
              ? "Your Turn" 
              : `${gameData.currentPlayer.name}'s Turn`}
          </p>
        )}
      </div>
    </div>
  );
};

export default Game; 