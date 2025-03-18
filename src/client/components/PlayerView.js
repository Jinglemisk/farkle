/**
 * PlayerView component
 * Displays a player representation on the game table
 * Shows player avatar, name, and current score
 * Highlights when it's the player's turn
 */

import React from 'react';
import '../styles/playerView.css';

const PlayerView = ({ player, isCurrentPlayer, isLocalPlayer }) => {
  // Generate CSS classes based on player state
  const playerClasses = [
    'player-view',
    isCurrentPlayer ? 'current-player' : '',
    isLocalPlayer ? 'local-player' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={playerClasses}>
      <div className="player-avatar">
        {/* Display first letter of player name as avatar */}
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="player-info">
        <div className="player-name">
          {player.name} {isLocalPlayer && '(You)'}
        </div>
        <div className="player-score">
          Score: {player.score || 0}
        </div>
      </div>
      {isCurrentPlayer && <div className="turn-indicator">Current Turn</div>}
    </div>
  );
};

export default PlayerView; 