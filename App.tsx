
import React, { useMemo } from 'react';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import Die from './components/Die';
import Modal from './components/Modal';
import LobbyCreationScreen from './components/LobbyCreationScreen';
import LobbyScreen from './components/LobbyScreen';
import { GameStatus, Screen } from './types';
import { WINNING_SCORE } from './constants';
import { calculateScore, isScoringDie, checkForFarkle } from './utils/scoring';

const App: React.FC = () => {
  const {
    screen,
    error,
    lobbyCode,
    isHost,
    players,
    createOrJoinLobby,
    startGame,
    gameState,
    rollDice,
    selectDie,
    keepDice,
    bankScore,
    handleFarkle,
    getCurrentPlayer,
    isMyTurn,
    winner,
  } = useMultiplayerGame();

  // Always call hooks - compute game values even if not on game screen
  const dice = gameState?.dice || [];
  const keptDice = gameState?.keptDice || [];
  const turnScore = gameState?.turnScore || 0;
  const myTurn = isMyTurn();
  const currentPlayer = getCurrentPlayer();

  const selectedDice = useMemo(() => dice.filter(d => d.isSelected), [dice]);
  const unselectedDice = useMemo(() => dice.filter(d => !d.isSelected), [dice]);
  const scoreForSelection = useMemo(() => calculateScore(selectedDice.map(d => d.value)), [selectedDice]);

  // Render lobby creation screen
  if (screen === Screen.LobbyCreation) {
    return <LobbyCreationScreen onCreateOrJoin={createOrJoinLobby} error={error} />;
  }

  // Render lobby screen
  if (screen === Screen.Lobby) {
    return (
      <LobbyScreen
        lobbyCode={lobbyCode}
        players={players}
        isHost={isHost}
        onStartGame={startGame}
      />
    );
  }

  // Game screen - render only if gameState exists
  if (screen !== Screen.Game || !gameState) {
    return null;
  }

  const canKeep = scoreForSelection > 0;
  const canRoll = myTurn && gameState.gameStatus === 'PLAYER_TURN';
  const canBank = myTurn && (turnScore > 0 || (gameState.gameStatus === 'DICE_ROLLED' && canKeep));

  // Check for farkle
  const isFarkle = gameState.gameStatus === 'DICE_ROLLED' && dice.length > 0 && checkForFarkle(dice.map(d => d.value));

  const handleRollDice = () => {
    rollDice();
  };

  const handleSelectDie = (dieId: number) => {
    if (gameState.gameStatus === 'DICE_ROLLED' && myTurn) {
      selectDie(dieId);
    }
  };

  const handleKeepDice = () => {
    if (!canKeep) return;
    keepDice(scoreForSelection);
  };

  const handleBankScore = () => {
    let finalTurnScore = turnScore;

    if (gameState.gameStatus === 'DICE_ROLLED') {
      finalTurnScore += scoreForSelection;
    }

    bankScore(finalTurnScore);
  };

  const handleFarkleAck = () => {
    handleFarkle();
  };

  const renderDice = (diceSet: typeof dice, isKept: boolean = false) => {
    const allDiceValues = dice.map(d => d.value);
    const showPlaceholder = !isKept && gameState.gameStatus === 'PLAYER_TURN';

    return diceSet.map(d => {
      const isScoring = isKept ? undefined : isScoringDie(d.value, allDiceValues);

      return (
        <Die
          key={d.id}
          value={d.value}
          isSelected={d.isSelected}
          isKept={isKept}
          isScoring={isScoring}
          showPlaceholder={showPlaceholder}
          onClick={() => !isKept && gameState.gameStatus === 'DICE_ROLLED' && handleSelectDie(d.id)}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex flex-col items-center justify-center p-4">
      {winner && (
        <Modal
          title={`${winner.nickname} Wins!`}
          message={`Congratulations! ${winner.nickname} scored ${winner.score} points and won the game!`}
          onClose={() => window.location.reload()}
          buttonText="Back to Lobby"
        />
      )}

      {isFarkle && (
        <Modal
          title="Farkle!"
          message={`No scoring dice! ${currentPlayer?.nickname || 'Player'} lost their turn score.`}
          onClose={handleFarkleAck}
          buttonText="Next Turn"
        />
      )}

      <div className="w-full max-w-4xl mx-auto bg-stone-800/50 backdrop-blur-sm shadow-2xl rounded-lg border-4 border-amber-800 p-6">
        <header className="text-center mb-4">
          <h1 className="text-5xl font-bold text-amber-300 tracking-wider">FARKLE</h1>
          <p className="text-amber-200">Score {WINNING_SCORE} points to win!</p>
          {currentPlayer && (
            <div className={`mt-2 text-lg font-semibold ${myTurn ? 'text-lime-400' : 'text-amber-200'}`}>
              {myTurn ? "YOUR TURN" : `${currentPlayer.nickname}'s Turn`}
            </div>
          )}
        </header>

        <main>
          {/* Game Area */}
          <div className="bg-green-900/70 border-4 border-amber-600 rounded-lg p-6 min-h-[300px] flex flex-col justify-between shadow-lg">
            {/* Kept Dice Area */}
            <div>
              <h3 className="text-center text-amber-200 mb-2">Kept Dice ({keptDice.length})</h3>
              <div className="flex justify-center items-center gap-4 min-h-[70px] bg-black/20 p-2 rounded">
                {keptDice.length > 0 ? renderDice(keptDice, true) : <p className="text-stone-400">No dice kept yet</p>}
              </div>
            </div>

            {/* Rolled Dice Area */}
            <div>
              <h3 className="text-center text-amber-200 mb-2">Current Roll ({dice.length})</h3>
              <div className="flex flex-wrap justify-center items-center gap-4 min-h-[70px]">
                {dice.length > 0 ? (
                  <>
                    {renderDice(unselectedDice)}
                    {selectedDice.length > 0 && <div className="border-l-2 border-amber-400 h-12 mx-2"></div>}
                    {renderDice(selectedDice)}
                  </>
                ) : keptDice.length > 0 && keptDice.length < 6 ? (
                  <p className="text-stone-300">Roll the remaining dice!</p>
                ) : (
                  <p className="text-stone-300">Ready to roll!</p>
                )}
              </div>
            </div>
          </div>


          {/* Game Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            {gameState.gameStatus === 'PLAYER_TURN' && (
              <>
                <button
                  onClick={handleRollDice}
                  disabled={!canRoll}
                  className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 disabled:text-stone-400 font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {turnScore > 0 ? `Roll Again (${dice.length || 6})` : `Roll Dice (6)`}
                </button>
                {turnScore > 0 && (
                  <button
                    onClick={handleBankScore}
                    disabled={!canBank}
                    className="bg-lime-600 hover:bg-lime-500 disabled:bg-stone-600 text-white disabled:text-stone-400 font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100">
                    Bank Score
                  </button>
                )}
              </>
            )}
            {gameState.gameStatus === 'DICE_ROLLED' && !isFarkle && (
              <>
                <button
                  onClick={handleKeepDice}
                  disabled={!canKeep || !myTurn}
                  className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 disabled:text-stone-400 font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100">
                  Keep & Roll
                </button>
                <button
                  onClick={handleBankScore}
                  disabled={!canBank || !myTurn}
                  className="bg-lime-600 hover:bg-lime-500 disabled:bg-stone-600 text-white disabled:text-stone-400 font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100">
                  Bank Score
                </button>
              </>
            )}
          </div>
        </main>

        <footer className="mt-8">
          {/* All Players Scores */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {players.map((player) => (
              <div
                key={player.id}
                className={`
                  bg-stone-900/70 border-4 rounded-lg p-4 text-center
                  ${gameState.currentPlayerTurn === player.id ? 'border-lime-500' : 'border-amber-600'}
                `}
              >
                <p className="text-amber-200 text-sm font-semibold truncate">{player.nickname}</p>
                <p className="text-3xl font-bold text-white">{player.score}</p>
                {gameState.currentPlayerTurn === player.id && (
                  <p className="text-lime-400 text-xs mt-1">PLAYING</p>
                )}
              </div>
            ))}
          </div>

          {/* Current Turn Info */}
          <div className="bg-stone-900/70 border-t-4 border-amber-600 px-8 py-5 rounded-lg shadow-inner text-center">
            <span className="text-sm uppercase tracking-[0.3em] text-amber-200">Turn Score</span>
            <span className="block text-4xl font-bold text-white">{turnScore}</span>
            {selectedDice.length > 0 && scoreForSelection > 0 && (
              <p className="text-lime-400 text-sm mt-2">+{scoreForSelection} if kept</p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
