import React, { useState } from 'react';

interface LobbyCreationScreenProps {
  onCreateOrJoin: (nickname: string, lobbyCode?: string) => void;
  error?: string;
}

const LobbyCreationScreen: React.FC<LobbyCreationScreenProps> = ({ onCreateOrJoin, error }) => {
  const [nickname, setNickname] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onCreateOrJoin(nickname.trim(), lobbyCode.trim() || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-stone-800/50 backdrop-blur-sm shadow-2xl rounded-lg border-4 border-amber-800 p-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-300 tracking-wider mb-2">FARKLE</h1>
          <p className="text-amber-200 text-lg">Multiplayer Dice Game</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-amber-200 text-sm font-semibold mb-2">
              Your Nickname
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="Enter your nickname"
              className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600 rounded-lg text-amber-100 placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="lobbyCode" className="block text-amber-200 text-sm font-semibold mb-2">
              Lobby Code (Optional)
            </label>
            <input
              type="text"
              id="lobbyCode"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="Enter 6-letter code to join"
              className="w-full px-4 py-3 bg-stone-700 border-2 border-amber-600 rounded-lg text-amber-100 placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors uppercase"
            />
            <p className="text-stone-400 text-xs mt-1">Leave empty to create a new lobby</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
          >
            {lobbyCode ? 'Join Lobby' : 'Create Lobby'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-stone-700">
          <h3 className="text-amber-200 font-semibold mb-2">How to Play:</h3>
          <ul className="text-stone-300 text-sm space-y-1">
            <li>• 2-4 players take turns rolling dice</li>
            <li>• Score points with 1s, 5s, and combinations</li>
            <li>• First to 500 points wins!</li>
            <li>• Be careful not to Farkle (no scoring dice)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LobbyCreationScreen;