/**
 * Lobby component
 * Responsible for:
 * - Player name input and joining
 * - Displaying list of players in the lobby
 * - Game mode selection (Rush, Sprint, Marathon)
 * - Starting the game (host only)
 */

import React from 'react';
import '../styles/lobby.css';

const Lobby = ({ socket, playerName, setPlayerName, players, gameMode, setGameMode }) => {
  // Handler for joining game
  const handleJoinGame = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      socket.emit('joinGame', playerName);
    }
  };

  // Handler for starting game (host only)
  const handleStartGame = () => {
    socket.emit('startGame', gameMode);
  };

  // Handler for game mode selection
  const handleGameModeChange = (mode) => {
    setGameMode(mode);
  };

  // Determine if current player is the host (first player)
  const isHost = players.length > 0 && players[0].id === socket.id;

  return (
    <div className="lobby-container">
      <div className="tavern-header">
        <h1>The Farkle Tavern</h1>
        <p className="tavern-keeper">Welcome, weary traveler! I am the Tavern Keeper.</p>
        <p className="tavern-description">
          Gather 'round the hearth, for tonight we shall play the ancient game of Farkle! 
          A game of chance and cunning, where fortunes can change with the roll of the dice.
        </p>
      </div>

      {/* Player join form */}
      {!players.some(player => player.id === socket.id) ? (
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
            />
          </div>
          <button type="submit" className="join-button">Enter the Tavern</button>
        </form>
      ) : (
        <div className="welcome-message">
          <p>Welcome back, {playerName}! The tavern is glad to have thee.</p>
        </div>
      )}

      {/* Player list */}
      <div className="player-list">
        <h2>Gathered Adventurers</h2>
        <ul>
          {players.map((player, index) => (
            <li key={player.id}>
              {player.name} {player.id === socket.id && "(Thou)"} {index === 0 && "(Tavern Master)"}
            </li>
          ))}
        </ul>
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