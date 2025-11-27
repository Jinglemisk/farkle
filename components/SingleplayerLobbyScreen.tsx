import React, { useState } from 'react';
import { GameMode, Player } from '../types';
import { GAME_MODES } from '../constants';
import SoundToggle from './SoundToggle';

interface SingleplayerLobbyScreenProps {
  player: Player;
  onStartGame: (gameMode: GameMode) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const SingleplayerLobbyScreen: React.FC<SingleplayerLobbyScreenProps> = ({
  player,
  onStartGame,
  soundEnabled,
  toggleSound,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('standard');

  return (
    <div className="min-h-screen bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex items-center justify-center px-3 py-4 lg:px-6 lg:py-6 overflow-y-auto lg:overflow-hidden">
      <div className="w-full max-w-3xl mx-auto bg-stone-800/60 backdrop-blur-sm shadow-2xl rounded-xl border-4 border-amber-800 p-4 sm:p-6 lg:p-7 flex flex-col gap-6">
        <header className="text-center relative">
          <div className="absolute top-0 right-0">
            <SoundToggle soundEnabled={soundEnabled} toggleSound={toggleSound} />
          </div>
          <h1 className="text-4xl font-bold text-amber-300 tracking-[0.35em] mb-1">FARKLE</h1>
          <p className="text-amber-200 text-sm sm:text-base">Solo Play</p>
        </header>

        <div className="bg-stone-900/70 border-4 border-amber-700 rounded-lg p-4 sm:p-5 flex items-center gap-4 justify-center">
          <div className="bg-stone-900 border-4 border-amber-600 rounded-lg p-2">
            <img
              src={`/images/farkle-avatar-${player.avatar}.png`}
              alt={`${player.nickname}'s avatar`}
              className="w-16 h-16 object-cover rounded-lg"
            />
          </div>
          <div>
            <p className="text-amber-200 text-xl font-bold">{player.nickname}</p>
            <p className="text-stone-400 text-sm">Ready to play!</p>
          </div>
        </div>

        <div className="bg-stone-900/70 border-4 border-amber-700 rounded-lg p-4 sm:p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-amber-200 font-semibold text-center mb-3">Choose Game Mode</h3>
            <div className="flex flex-col gap-2">
              {(Object.keys(GAME_MODES) as GameMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setGameMode(mode)}
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                    gameMode === mode
                      ? 'bg-amber-600 text-stone-900 shadow-md scale-105'
                      : 'bg-stone-700/50 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{GAME_MODES[mode].label}</span>
                    <span className="text-xs opacity-80">Target: {GAME_MODES[mode].winningScore} pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStartGame(gameMode)}
            className="w-full bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold py-3 px-5 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Start Game
          </button>
        </div>

        <div className="bg-stone-900/70 border border-amber-700 rounded-lg p-4 text-xs text-stone-200">
          <h3 className="text-amber-200 font-semibold mb-2 text-center text-sm">Quick Rules</h3>
          <ul className="list-disc list-inside space-y-1 leading-tight">
            <li>Take turns rolling to collect scoring dice.</li>
            <li>1s = 100 points, 5s = 50 points.</li>
            <li>Three of a kind scores face value × 100 (1s = 1000).</li>
            <li>Bank points before you Farkle with no scorers.</li>
            <li>Reach {GAME_MODES[gameMode].winningScore} points to win!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SingleplayerLobbyScreen;
