import React from 'react';
import { Player } from '../types';

interface LobbyScreenProps {
  lobbyCode: string;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ lobbyCode, players, isHost, onStartGame }) => {
  const canStart = players.length >= 2 && isHost;

  return (
    <div className="min-h-screen bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-stone-800/50 backdrop-blur-sm shadow-2xl rounded-lg border-4 border-amber-800 p-8">
        <header className="text-center mb-6">
          <h1 className="text-5xl font-bold text-amber-300 tracking-wider mb-2">FARKLE</h1>
          <p className="text-amber-200 text-lg">Game Lobby</p>
        </header>

        {/* Lobby Code Display */}
        <div className="bg-stone-900/70 border-4 border-amber-600 rounded-lg p-6 mb-6 text-center">
          <p className="text-amber-200 text-sm mb-2">Lobby Code</p>
          <div className="text-5xl font-bold text-amber-400 tracking-widest mb-2">
            {lobbyCode}
          </div>
          <p className="text-stone-400 text-sm">Share this code with friends to join!</p>
        </div>

        {/* Player Seats */}
        <div className="mb-6">
          <h2 className="text-amber-200 text-xl font-semibold mb-4 text-center">
            Players ({players.length}/4)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((seatIndex) => {
              const player = players[seatIndex];
              const isEmpty = !player;

              return (
                <div
                  key={seatIndex}
                  className={`
                    ${isEmpty ? 'bg-stone-700/50 border-stone-600' : 'bg-green-900/50 border-amber-600'}
                    border-4 rounded-lg p-4 min-h-[80px] flex items-center justify-center
                    transition-all duration-200
                  `}
                >
                  {isEmpty ? (
                    <div className="text-center">
                      <p className="text-stone-400 text-sm">Seat {seatIndex + 1}</p>
                      <p className="text-stone-500 text-xs">Waiting...</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <div className="bg-stone-900 border-2 border-amber-600 rounded-lg p-1 flex-shrink-0">
                        <img
                          src={`/images/farkle-avatar-${player.avatar}.png`}
                          alt={`${player.nickname}'s avatar`}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-amber-200 font-semibold text-lg truncate">
                          {player.nickname}
                        </p>
                        {player.id === players[0]?.id && (
                          <span className="inline-block bg-amber-600 text-stone-900 text-xs font-bold px-2 py-1 rounded mt-1">
                            HOST
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-stone-900/50 border-2 border-stone-700 rounded-lg p-4 mb-6">
          <p className="text-amber-200 text-sm text-center">
            {players.length < 2
              ? 'Waiting for at least 2 players to start...'
              : isHost
              ? 'Ready to start! Click the button below.'
              : 'Waiting for host to start the game...'}
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartGame}
          disabled={!canStart}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 disabled:text-stone-400 font-bold py-4 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:bg-stone-600"
        >
          {isHost
            ? canStart
              ? 'Start Game'
              : `Need ${2 - players.length} more player${2 - players.length === 1 ? '' : 's'}`
            : 'Waiting for Host'}
        </button>

        {/* Game Rules Reminder */}
        <div className="mt-6 pt-6 border-t-2 border-stone-700">
          <h3 className="text-amber-200 font-semibold mb-2 text-center">Quick Rules:</h3>
          <ul className="text-stone-300 text-sm space-y-1">
            <li>• Take turns rolling dice to score points</li>
            <li>• 1s = 100 points, 5s = 50 points</li>
            <li>• Three of a kind = face value × 100 (except 1s = 1000)</li>
            <li>• Bank your score or risk it all for more points</li>
            <li>• First player to reach 500 points wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;