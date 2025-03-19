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
import { socket } from '../socket';
import '../styles/game.css';

const Game = ({ players = [], gameMode = 'Sprint', currentTurn = null, currentRoll = [], selectedDice = [], preBankedPoints = 0, hasHotDice = false }) => {
  const [gameState, setGameState] = useState({
    players,
    gameMode,
    currentTurn,
    currentRoll,
    selectedDice,
    preBankedPoints,
    hasHotDice,
    initialRolls: null,
    isMyTurn: false,
    showingInitialRolls: false
  });

  // Update game state when props change
  useEffect(() => {
    console.log('Props changed:', {
      players,
      gameMode,
      currentTurn,
      currentRoll,
      selectedDice,
      preBankedPoints,
      hasHotDice
    });
    
    if (players.length > 0) {
      setGameState(prev => {
        const newState = {
          ...prev,
          players,
          gameMode,
          currentTurn,
          currentRoll,
          selectedDice,
          preBankedPoints,
          hasHotDice,
          isMyTurn: currentTurn === socket.id
        };
        console.log('New game state:', newState);
        return newState;
      });
    }
  }, [players, gameMode, currentTurn, currentRoll, selectedDice, preBankedPoints, hasHotDice]);

  // Set up socket event listeners
  useEffect(() => {
    console.log('Setting up socket event listeners');
    
    const handleGameState = (state) => {
      console.log('Received game state update:', state);
      if (state.players && state.players.length > 0) {
        setGameState(prev => ({
          ...prev,
          ...state,
          isMyTurn: state.currentTurn === socket.id,
          showingInitialRolls: false
        }));
      }
    };

    const handleGameStarted = (data) => {
      console.log('Game started with data:', data);
      if (data.players && data.players.length > 0) {
        setGameState(prev => ({
          ...prev,
          ...data,
          initialRolls: data.initialRolls,
          isMyTurn: data.currentTurn === socket.id,
          showingInitialRolls: true
        }));
      }
    };

    const handleDiceRolled = (data) => {
      console.log('Dice rolled:', data);
      setGameState(prev => ({
        ...prev,
        currentRoll: data.currentRoll || [],
        hasHotDice: data.hasHotDice || false
      }));
    };

    const handleDiceSelected = (data) => {
      console.log('Dice selected:', data);
      setGameState(prev => ({
        ...prev,
        currentRoll: data.currentRoll || [],
        selectedDice: data.selectedDice || [],
        preBankedPoints: data.preBankedPoints || 0,
        hasHotDice: data.hasHotDice || false
      }));
    };

    const handlePointsBanked = (data) => {
      console.log('Points banked:', data);
      if (data.players && data.players.length > 0) {
        setGameState(prev => {
          // Create new state with all dice-related state reset
          const newState = {
            ...prev,
            players: data.players, // Update player scores
            currentTurn: data.currentTurn,
            currentRoll: [], // Reset current roll
            selectedDice: [], // Reset selected dice
            preBankedPoints: 0, // Reset pre-banked points
            hasHotDice: false, // Reset hot dice status
            isMyTurn: data.currentTurn === socket.id // Update turn status
          };

          // Log the state transition
          console.log('Turn ended, resetting game state:', newState);
          return newState;
        });
      }
    };

    const handleFarkle = (data) => {
      console.log('Player Farkled:', data);
      if (data.players && data.players.length > 0) {
        setGameState(prev => {
          const newState = {
            ...prev,
            players: data.players,
            currentTurn: data.currentTurn,
            currentRoll: [],
            selectedDice: [],
            preBankedPoints: 0,
            hasHotDice: false,
            isMyTurn: data.currentTurn === socket.id
          };

          // Show Farkle message if it was the current player
          if (socket.id === prev.currentTurn) {
            setTimeout(() => {
              alert('FARKLE! You rolled no scoring dice and lost your turn!');
            }, 100);
          }

          // Log the state transition
          console.log('Farkle occurred, resetting game state:', newState);
          return newState;
        });

        // Emit a gameState update to ensure all clients are in sync
        socket.emit('requestGameState');
      }
    };

    socket.on('gameState', handleGameState);
    socket.on('gameStarted', handleGameStarted);
    socket.on('diceRolled', handleDiceRolled);
    socket.on('diceSelected', handleDiceSelected);
    socket.on('pointsBanked', handlePointsBanked);
    socket.on('farkle', handleFarkle);

    return () => {
      console.log('Cleaning up socket event listeners');
      socket.off('gameState', handleGameState);
      socket.off('gameStarted', handleGameStarted);
      socket.off('diceRolled', handleDiceRolled);
      socket.off('diceSelected', handleDiceSelected);
      socket.off('pointsBanked', handlePointsBanked);
      socket.off('farkle', handleFarkle);
    };
  }, []);

  // Don't render until we have players
  if (!gameState.players || gameState.players.length === 0) {
    return <div className="game-container">Loading game...</div>;
  }

  const handleRollDice = () => {
    console.log('Rolling dice...');
    if (gameState.isMyTurn) {
      socket.emit('rollDice');
    }
  };

  const handleSelectDie = (index) => {
    console.log('Selecting die at index:', index);
    if (gameState.isMyTurn && gameState.currentRoll[index]) {
      socket.emit('selectDie', { diceIndex: index });
    }
  };

  const handleBankPoints = () => {
    console.log('Banking points:', gameState.preBankedPoints);
    if (gameState.isMyTurn && gameState.preBankedPoints > 0) {
      socket.emit('bankPoints');
    }
  };

  return (
    <div className="game-container">
      <div className="scoreboard">
        <h2>Scoreboard</h2>
        {gameState.players.map(player => (
          <div 
            key={player.id} 
            className={`player-score ${player.id === gameState.currentTurn ? 'current-turn' : ''}`}
          >
            <span className="player-name">{player.name}</span>
            <span className="player-points">{player.score || 0}</span>
          </div>
        ))}
      </div>

      {gameState.showingInitialRolls && gameState.initialRolls && gameState.initialRolls.length > 0 && (
        <div className="initial-rolls">
          <h3>Rolling Dice for Turn Order...</h3>
          {gameState.initialRolls.map(roll => (
            <div key={roll.id} className="initial-roll">
              {roll.name}: <span className="dice-value">{roll.roll}</span>
            </div>
          ))}
          <p className="turn-announcement">
            {gameState.players[0].name} rolled highest and will go first!
          </p>
        </div>
      )}

      {!gameState.showingInitialRolls && (
        <div className="game-area">
          {/* Current player's dice */}
          <div className="dice-section">
            <h3>Your Dice</h3>
            <div className="dice-grid">
              {gameState.currentRoll.map((value, index) => (
                <div
                  key={index}
                  className={`die ${gameState.isMyTurn ? 'selectable' : ''}`}
                  onClick={() => handleSelectDie(index)}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>

          {/* Selected dice */}
          {gameState.selectedDice.length > 0 && (
            <div className="selected-dice-section">
              <h3>Selected Dice</h3>
              <div className="dice-grid">
                {gameState.selectedDice.map((value, index) => (
                  <div key={index} className="die selected">
                    {value}
                  </div>
                ))}
              </div>
              <div className="pre-bank-section">
                <p>Pre-banked Points: {gameState.preBankedPoints}</p>
              </div>
            </div>
          )}

          {/* Game controls */}
          {gameState.isMyTurn && (
            <div className="game-controls">
              <button
                onClick={handleRollDice}
                disabled={gameState.currentRoll.length === 0 && !gameState.hasHotDice}
              >
                {gameState.hasHotDice ? 'Roll Again (Hot Dice!)' : 'Roll Dice'}
              </button>
              <button
                onClick={handleBankPoints}
                disabled={gameState.preBankedPoints === 0}
              >
                Bank Points ({gameState.preBankedPoints})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Game; 