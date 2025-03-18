/**
 * Lobby component
 * Responsible for:
 * - Player name input and joining
 * - Displaying list of players in the lobby
 * - Game mode selection (Rush, Sprint, Marathon)
 * - Starting the game (host only)
 */

import React, { useState, useCallback } from 'react';
import '../styles/lobby.css';

const Lobby = ({ socket, playerName, setPlayerName, players, gameMode, setGameMode }) => {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  // Get player status - check if player is already in the game
  const isPlayerJoined = players.some(player => player.id === socket.id);
  
  // Determine if current player is the host (first player)
  const isHost = players.length > 0 && players[0].id === socket.id;

  // Handler for joining game
  const handleJoinGame = useCallback((e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('Please enter a name to join the game');
      return;
    }
    
    setJoining(true);
    setError(null);
    
    // Emit join event to server
    socket.emit('joinGame', playerName);
    
    // Set timeout to reset joining state if no response after 3 seconds
    const timeout = setTimeout(() => {
      setJoining(false);
      setError('Failed to join game. Please try again.');
    }, 3000);
    
    // Set up one-time event listener for join confirmation
    socket.once('joinConfirmed', () => {
      clearTimeout(timeout);
      setJoining(false);
    });
  }, [playerName, socket]);

  // Handler for starting game (host only)
  const handleStartGame = useCallback(() => {
    if (isHost) {
      socket.emit('startGame', gameMode);
    }
  }, [socket, gameMode, isHost]);

  // Handler for game mode selection
  const handleGameModeChange = useCallback((mode) => {
    setGameMode(mode);
  }, [setGameMode]);

  return (
    <div className="lobby-container">
      <div className="tavern-header">
        <h1>Lucky Roll Tavern</h1>
        <p className="tavern-keeper">Welcome, weary traveler! I am the Tavern Keeper.</p>
        <p className="tavern-description">
          Gather 'round the hearth, for tonight we shall play the ancient game of Farkle! 
          A game of chance and cunning, where fortunes can change with the roll of the dice.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Player join form */}
      {!isPlayerJoined ? (
        <form onSubmit={handleJoinGame} className="join-form">
          <div className="form-group">
            <label htmlFor="playerName">What shall I call thee, adventurer?</label>
            <input
              id="playerName"
              type="text"
              placeholder="Enter thy name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
              disabled={joining}
            />
          </div>
          <button 
            type="submit" 
            className="join-button"
            disabled={joining || !playerName.trim()}
          >
            {joining ? "Entering..." : "Enter the Tavern"}
          </button>
        </form>
      ) : (
        <div className="welcome-message">
          <p>Welcome back, {playerName}! The tavern is glad to have thee.</p>
        </div>
      )}

      {/* Player list */}
      <div className="player-list">
        <h2>Gathered Adventurers</h2>
        {players.length === 0 ? (
          <p className="no-players">The tavern awaits its first guest...</p>
        ) : (
          <ul>
            {players.map((player, index) => (
              <li key={player.id} className={player.id === socket.id ? 'current-player' : ''}>
                {player.name} {player.id === socket.id && "(Thou)"} {index === 0 && "(Patron)"}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Game mode selection (host only) */}
      {isHost && (
        <div className="game-options">
          <h2>Choose Thy Challenge</h2>
          <div className="mode-tabs">
            <button 
              className={`mode-tab ${gameMode === 'Rush' ? 'active' : ''}`}
              onClick={() => handleGameModeChange('Rush')}
            >
              Rush (2000 points)
            </button>
            <button 
              className={`mode-tab ${gameMode === 'Sprint' ? 'active' : ''}`}
              onClick={() => handleGameModeChange('Sprint')}
            >
              Sprint (4000 points)
            </button>
            <button 
              className={`mode-tab ${gameMode === 'Marathon' ? 'active' : ''}`}
              onClick={() => handleGameModeChange('Marathon')}
            >
              Marathon (7000 points)
            </button>
          </div>
          
          <button 
            onClick={handleStartGame} 
            disabled={players.length < 2}
            className="start-button"
          >
            Begin the Game!
          </button>
          {players.length < 2 && (
            <p className="waiting-message">
              We need at least two brave souls to begin the game!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Lobby; 