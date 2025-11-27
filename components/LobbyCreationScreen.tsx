import React, { useState } from 'react';
import SoundToggle from './SoundToggle';

interface LobbyCreationScreenProps {
  onCreateOrJoin: (nickname: string, avatar: number, lobbyCode?: string, playMode?: 'singleplayer' | 'multiplayer') => void;
  error?: string;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const LobbyCreationScreen: React.FC<LobbyCreationScreenProps> = ({ onCreateOrJoin, error, soundEnabled, toggleSound }) => {
  const [nickname, setNickname] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [playMode, setPlayMode] = useState<'singleplayer' | 'multiplayer'>('multiplayer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onCreateOrJoin(
        nickname.trim(),
        selectedAvatar,
        playMode === 'multiplayer' ? (lobbyCode.trim() || undefined) : undefined,
        playMode
      );
    }
  };

  const cycleAvatar = (direction: 'left' | 'right') => {
    setSelectedAvatar(prev => {
      if (direction === 'left') {
        return prev === 1 ? 6 : prev - 1;
      } else {
        return prev === 6 ? 1 : prev + 1;
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex items-center justify-center px-3 py-4 lg:px-6 lg:py-6 overflow-y-auto lg:overflow-hidden">
      <div className="w-full max-w-5xl mx-auto bg-stone-800/60 backdrop-blur-sm shadow-2xl rounded-xl border-4 border-amber-800 p-4 sm:p-6 lg:p-7 lg:h-[86vh] flex flex-col gap-6 lg:overflow-hidden">
        <header className="text-center lg:text-left relative">
          <div className="absolute top-0 right-0">
            <SoundToggle soundEnabled={soundEnabled} toggleSound={toggleSound} />
          </div>
          <h1 className="text-4xl font-bold text-amber-300 tracking-[0.35em] mb-1">FARKLE</h1>
          <p className="text-amber-200 text-sm sm:text-base">Multiplayer Dice Game</p>
        </header>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6 flex-1 min-h-0">
          <form onSubmit={handleSubmit} className="bg-stone-900/70 border-4 border-amber-700 rounded-lg p-4 sm:p-5 flex flex-col gap-4 min-h-0">
            <div className="grid gap-4">
              <div>
                <label htmlFor="nickname" className="block text-amber-200 text-xs sm:text-sm font-semibold mb-2">
                  Your Nickname
                </label>
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  placeholder="Enter your nickname"
                  className="w-full px-4 py-2.5 bg-stone-700 border-2 border-amber-600 rounded-lg text-amber-100 placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-amber-200 text-xs sm:text-sm font-semibold mb-2">
                  Choose Your Avatar
                </label>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => cycleAvatar('left')}
                    className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold w-9 h-9 rounded-lg shadow-md transition-transform transform hover:scale-110"
                    aria-label="Previous avatar"
                  >
                    ←
                  </button>
                  <div className="bg-stone-700 border-4 border-amber-600 rounded-lg p-2">
                    <img
                      src={`/images/farkle-avatar-${selectedAvatar}.png`}
                      alt={`Avatar ${selectedAvatar}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => cycleAvatar('right')}
                    className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold w-9 h-9 rounded-lg shadow-md transition-transform transform hover:scale-110"
                    aria-label="Next avatar"
                  >
                    →
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-amber-200 text-xs sm:text-sm font-semibold mb-2">
                  Play Mode
                </label>
                <div className="flex items-center gap-2 bg-stone-900/80 border border-amber-700 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setPlayMode('singleplayer')}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                      playMode === 'singleplayer'
                        ? 'bg-amber-500 text-stone-900'
                        : 'text-amber-200 hover:bg-amber-500/20'
                    }`}
                  >
                    Solo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayMode('multiplayer')}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                      playMode === 'multiplayer'
                        ? 'bg-amber-500 text-stone-900'
                        : 'text-amber-200 hover:bg-amber-500/20'
                    }`}
                  >
                    Multiplayer
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="lobbyCode" className="block text-amber-200 text-xs sm:text-sm font-semibold mb-2">
                  Lobby Code (Optional)
                </label>
                <input
                  type="text"
                  id="lobbyCode"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="Enter 6-letter code to join"
                  disabled={playMode === 'singleplayer'}
                  className={`w-full px-4 py-2.5 border-2 border-amber-600 rounded-lg text-amber-100 placeholder-stone-400 focus:outline-none transition-colors uppercase ${
                    playMode === 'singleplayer'
                      ? 'bg-stone-800 cursor-not-allowed opacity-50'
                      : 'bg-stone-700 focus:border-amber-400'
                  }`}
                />
                <p className="text-stone-400 text-xs mt-1">
                  {playMode === 'singleplayer'
                    ? 'Not available in singleplayer mode'
                    : 'Leave empty to create a new lobby'}
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!nickname.trim()}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 font-bold py-2.5 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
            >
              {playMode === 'singleplayer'
                ? 'Play Solo'
                : lobbyCode ? 'Join Lobby' : 'Create Lobby'}
            </button>
          </form>

          <aside className="bg-stone-900/60 border-4 border-amber-700 rounded-lg p-4 sm:p-5 flex flex-col gap-4 min-h-0 text-stone-200 text-sm">
            <div>
              <h3 className="text-amber-200 font-semibold text-base mb-2">Quick Tips</h3>
              <ul className="space-y-1 text-stone-300">
                {playMode === 'multiplayer' ? (
                  <>
                    <li>• Share the code so friends can join instantly.</li>
                    <li>• Avatars help other players spot you quickly.</li>
                    <li>• A new lobby is created when no code is entered.</li>
                  </>
                ) : (
                  <>
                    <li>• Perfect your strategy in solo mode.</li>
                    <li>• Choose your game mode to set the winning score.</li>
                    <li>• Try to reach your personal best score.</li>
                  </>
                )}
              </ul>
            </div>
            <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-4 text-center">
              <p className="text-amber-200 text-sm font-semibold">Game Objective</p>
              <p className="text-stone-300 text-xs mt-1">
                {playMode === 'multiplayer'
                  ? 'Roll dice to score points, bank them before you Farkle, and be the first to reach the target score.'
                  : 'Roll dice to score points, bank them before you Farkle, and reach the target score to win!'}
              </p>
            </div>
            <div className="mt-auto text-center text-xs text-stone-400">
              <p>
                {playMode === 'multiplayer'
                  ? 'No installs required — just share the lobby code and start playing.'
                  : 'Jump right in and test your luck!'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LobbyCreationScreen;
