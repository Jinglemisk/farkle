import React, { useState } from 'react';
import { Player, GameMode } from '../types';
import { GAME_MODES } from '../constants';
import SoundToggle from './SoundToggle';

interface LobbyScreenProps {
  lobbyCode: string;
  players: Player[];
  isHost: boolean;
  onStartGame: (gameMode: GameMode) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ lobbyCode, players, isHost, onStartGame, soundEnabled, toggleSound }) => {
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const canStart = players.length >= 2 && isHost;

  return (
    <div className="min-h-screen bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex items-center justify-center px-3 py-4 lg:px-6 lg:py-6 overflow-y-auto lg:overflow-hidden">
      <div className="w-full max-w-5xl mx-auto bg-stone-800/60 backdrop-blur-sm shadow-2xl rounded-xl border-4 border-amber-800 p-4 sm:p-6 lg:p-7 lg:h-[88vh] flex flex-col gap-6 lg:overflow-hidden">
        <header className="text-center lg:text-left relative">
          <div className="absolute top-0 right-0">
            <SoundToggle soundEnabled={soundEnabled} toggleSound={toggleSound} />
          </div>
          <h1 className="text-4xl font-bold text-amber-300 tracking-[0.35em] mb-1">FARKLE</h1>
          <p className="text-amber-200 text-sm sm:text-base">Game Lobby</p>
        </header>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-6 flex-1 min-h-0">
          <section className="flex flex-col gap-4 min-h-0">
            <div className="bg-stone-900/70 border-4 border-amber-700 rounded-lg p-4 sm:p-5 text-center">
              <p className="text-amber-200 text-xs uppercase tracking-[0.25em] mb-1">Lobby Code</p>
              <div className="text-4xl sm:text-5xl font-bold text-amber-400 tracking-[0.4em] mb-2">
                {lobbyCode}
              </div>
              <p className="text-stone-400 text-xs sm:text-sm">Share this code with friends to join!</p>
            </div>

            <div className="flex-1 min-h-0 flex flex-col gap-3">
              <h2 className="text-amber-200 text-lg font-semibold text-center">Players ({players.length}/4)</h2>
              <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                {[0, 1, 2, 3].map((seatIndex) => {
                  const player = players[seatIndex];
                  const isEmpty = !player;

                  return (
                    <div
                      key={seatIndex}
                      className={`
                        ${isEmpty ? 'bg-stone-700/50 border-stone-600/70' : 'bg-green-900/50 border-amber-600'}
                        border-4 rounded-lg p-3 flex items-center justify-center text-center transition-all duration-200
                      `}
                    >
                      {isEmpty ? (
                        <div>
                          <p className="text-stone-400 text-sm">Seat {seatIndex + 1}</p>
                          <p className="text-stone-500 text-xs">Waiting...</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 w-full">
                          <div className="bg-stone-900 border-2 border-amber-600 rounded-lg p-1 flex-shrink-0">
                            <img
                              src={`/images/farkle-avatar-${player.avatar}.png`}
                              alt={`${player.nickname}'s avatar`}
                              className="w-10 h-10 object-cover rounded"
                            />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-amber-200 font-semibold text-base truncate">
                              {player.nickname}
                            </p>
                            {player.id === players[0]?.id && (
                              <span className="inline-block bg-amber-600 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase tracking-wide">
                                Host
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
          </section>

          <aside className="bg-stone-900/60 border-4 border-amber-700 rounded-lg p-4 sm:p-5 flex flex-col gap-3 min-h-0">
            <div className="bg-stone-900/80 border border-amber-600/50 rounded-lg p-3">
              <h3 className="text-amber-200 font-semibold mb-2 text-center text-sm">Game Mode</h3>
              <div className="flex flex-col gap-1.5">
                {(Object.keys(GAME_MODES) as GameMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setGameMode(mode)}
                    disabled={!isHost}
                    className={`px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      gameMode === mode
                        ? 'bg-amber-600 text-stone-900 shadow-md'
                        : 'bg-stone-700/50 text-stone-300 hover:bg-stone-700'
                    } ${!isHost ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    {GAME_MODES[mode].label} ({GAME_MODES[mode].winningScore} pts)
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onStartGame(gameMode)}
              disabled={!canStart}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 disabled:text-stone-400 font-bold py-2 px-5 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isHost
                ? canStart
                  ? 'Start Game'
                  : `Need ${2 - players.length} more player${2 - players.length === 1 ? '' : 's'}`
                : 'Waiting for Host'}
            </button>

            <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-3 text-xs text-stone-200">
              <h3 className="text-amber-200 font-semibold mb-1.5 text-center text-sm">Quick Rules</h3>
              <ul className="list-disc list-inside space-y-1 leading-tight">
                <li>Take turns rolling to collect scoring dice.</li>
                <li>1s = 100 points, 5s = 50 points.</li>
                <li>Three of a kind scores face value × 100 (1s = 1000).</li>
                <li>Bank points before you Farkle with no scorers.</li>
                <li>First player to reach {GAME_MODES[gameMode].winningScore} points wins!</li>
              </ul>
            </div>

            <div className="mt-auto" />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
