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

import React, { useState, useEffect } from 'react';
import '../styles/game.css';

const Game = ({ socket, playerName, players, gameMode }) => {
  // Game state
  const [gameState, setGameState] = useState({
    currentTurn: null,
    currentRoll: [],
    selectedDice: [],
    preBankedPoints: 0,
    hasHotDice: false,
    isMyTurn: false
  });

  // Update game state when receiving server events
  useEffect(() => {
    const handleGameState = (state) => {
      setGameState(prev => ({
        ...prev,
        ...state,
        isMyTurn: state.currentTurn === socket.id
      }));
    };

    const handleDiceRolled = (data) => {
      setGameState(prev => ({
        ...prev,
        currentRoll: data.currentRoll,
        hasHotDice: data.hasHotDice
      }));
    };

    const handleDiceSelected = (data) => {
      setGameState(prev => ({
        ...prev,
        currentRoll: data.currentRoll,
        selectedDice: data.selectedDice,
        preBankedPoints: data.preBankedPoints,
        hasHotDice: data.hasHotDice
      }));
    };

    const handlePointsBanked = (data) => {
      setGameState(prev => ({
        ...prev,
        currentTurn: data.currentTurn,
        isMyTurn: data.currentTurn === socket.id
      }));
    };

    // Register event listeners
    socket.on('gameState', handleGameState);
    socket.on('diceRolled', handleDiceRolled);
    socket.on('diceSelected', handleDiceSelected);
    socket.on('pointsBanked', handlePointsBanked);

    // Clean up on unmount
    return () => {
      socket.off('gameState', handleGameState);
      socket.off('diceRolled', handleDiceRolled);
      socket.off('diceSelected', handleDiceSelected);
      socket.off('pointsBanked', handlePointsBanked);
    };
  }, [socket]);

  // Game action handlers
  const handleRoll = () => {
    if (gameState.isMyTurn) {
      socket.emit('rollDice');
    }
  };

  const handleSelectDie = (index) => {
    if (gameState.isMyTurn) {
      socket.emit('selectDie', { diceIndex: index });
    }
  };

  const handleBank = () => {
    if (gameState.isMyTurn && gameState.preBankedPoints > 0) {
      socket.emit('bankPoints');
    }
  };

  return (
    <div className="game-container">
      <h1>Farkle - {gameMode} Mode</h1>
      
      {/* Scoreboard */}
      <div className="scoreboard">
        <h2>Scoreboard</h2>
        <div className="players-list">
          {players.map(player => (
            <div 
              key={player.id} 
              className={`player-score ${player.id === gameState.currentTurn ? 'current-turn' : ''}`}
            >
              {player.name}: {player.score}
            </div>
          ))}
        </div>
      </div>
      
      {/* Current player's dice */}
      <div className="dice-section">
        <h2>Your Dice</h2>
        <div className="dice-container">
          {gameState.currentRoll.map((value, index) => (
            <div 
              key={index}
              className="die"
              onClick={() => handleSelectDie(index)}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected dice */}
      <div className="selected-dice-section">
        <h2>Selected Dice</h2>
        <div className="dice-container">
          {gameState.selectedDice.map((value, index) => (
            <div 
              key={index}
              className="die selected"
            >
              {value}
            </div>
          ))}
        </div>
      </div>
      
      {/* Pre-banked points */}
      <div className="pre-bank-section">
        <h2>Pre-banked Points: {gameState.preBankedPoints}</h2>
      </div>
      
      {/* Game controls */}
      <div className="game-controls">
        <button 
          onClick={handleRoll}
          disabled={!gameState.isMyTurn}
          className={`game-button ${gameState.isMyTurn ? 'active' : ''}`}
        >
          {gameState.hasHotDice ? "Roll (Hot Dice!)" : "Roll Dice"}
        </button>
        
        <button 
          onClick={handleBank}
          disabled={!gameState.isMyTurn || gameState.preBankedPoints === 0}
          className={`game-button ${gameState.isMyTurn && gameState.preBankedPoints > 0 ? 'active' : ''}`}
        >
          Bank {gameState.preBankedPoints} Points
        </button>
      </div>
      
      {/* Turn indicator */}
      <div className="turn-indicator">
        {gameState.currentTurn && (
          <p>
            {gameState.currentTurn === socket.id 
              ? "Your Turn" 
              : `${players.find(p => p.id === gameState.currentTurn)?.name}'s Turn`}
          </p>
        )}
      </div>
    </div>
  );
};

export default Game; 