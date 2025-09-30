
import React, { useMemo } from 'react';
import { useFarkleGame } from './hooks/useFarkleGame';
import Die from './components/Die';
import Modal from './components/Modal';
import { GameStatus } from './types';
import { WINNING_SCORE } from './constants';
import { calculateScore } from './utils/scoring';

const App: React.FC = () => {
  const {
    gameStatus,
    dice,
    keptDice,
    totalScore,
    turnScore,
    handleNewGame,
    handleRollDice,
    handleSelectDie,
    handleKeepDice,
    handleBankScore,
  } = useFarkleGame();

  const selectedDice = useMemo(() => dice.filter(d => d.isSelected), [dice]);
  const unselectedDice = useMemo(() => dice.filter(d => !d.isSelected), [dice]);
  const scoreForSelection = useMemo(() => calculateScore(selectedDice.map(d => d.value)), [selectedDice]);

  const canKeep = scoreForSelection > 0;
  const canRoll = gameStatus === GameStatus.PlayerTurn;
  const canBank = turnScore > 0 || (gameStatus === GameStatus.DiceRolled && canKeep);

  const renderDice = (diceSet: typeof dice, isKept: boolean = false) => (
    diceSet.map(d => (
      <Die
        key={d.id}
        value={d.value}
        isSelected={d.isSelected}
        isKept={isKept}
        onClick={() => !isKept && gameStatus === GameStatus.DiceRolled && handleSelectDie(d.id)}
      />
    ))
  );

  return (
    <div className="min-h-screen bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex flex-col items-center justify-center p-4">
      {(gameStatus === GameStatus.GameOverWin || gameStatus === GameStatus.GameOverFarkle) && (
        <Modal
          title={gameStatus === GameStatus.GameOverWin ? "You Win!" : "Farkle!"}
          message={
            gameStatus === GameStatus.GameOverWin
              ? `Congratulations! You scored ${totalScore} points!`
              : "No scoring dice! You lost your turn score."
          }
          onClose={handleNewGame}
          buttonText={gameStatus === GameStatus.GameOverWin ? "Play Again" : "Next Turn"}
        />
      )}

      <div className="w-full max-w-4xl mx-auto bg-stone-800/50 backdrop-blur-sm shadow-2xl rounded-lg border-4 border-amber-800 p-6">
        <header className="text-center mb-4">
          <h1 className="text-5xl font-bold text-amber-300 tracking-wider">FARKLE</h1>
          <p className="text-amber-200">Score {WINNING_SCORE} points to win!</p>
        </header>

        <main>
          {/* Scoreboard */}
          <div className="flex justify-around bg-stone-900/50 p-4 rounded-md border-2 border-amber-900 mb-6 shadow-inner">
            <div className="text-center">
              <span className="text-xl text-amber-200 block">Total Score</span>
              <span className="text-4xl font-bold text-white">{totalScore}</span>
            </div>
            <div className="text-center">
              <span className="text-xl text-amber-200 block">Turn Score</span>
              <span className="text-4xl font-bold text-white">{turnScore}</span>
            </div>
          </div>

          {/* Game Area */}
          <div className="bg-green-900/70 border-4 border-amber-600 rounded-lg p-6 min-h-[300px] flex flex-col justify-between shadow-lg">
            {gameStatus === GameStatus.NotStarted ? (
               <div className="flex flex-col items-center justify-center h-full">
                <p className="text-2xl mb-4 text-amber-100">Ready to roll the dice?</p>
                <button
                    onClick={handleNewGame}
                    className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    Start Game
                </button>
               </div>
            ) : (
                <>
                    {/* Kept Dice Area */}
                    <div>
                        <h3 className="text-center text-amber-200 mb-2">Kept Dice ({keptDice.length})</h3>
                        <div className="flex justify-center items-center gap-4 min-h-[70px] bg-black/20 p-2 rounded">
                            {keptDice.length > 0 ? renderDice(keptDice, true) : <p className="text-stone-400">No dice kept yet</p>}
                        </div>
                    </div>

                    {/* Rolled Dice Area */}
                    <div>
                        <h3 className="text-center text-amber-200 mb-2">Your Roll ({dice.length})</h3>
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
                                <p className="text-stone-300">Ready for your first roll!</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>


          {/* Game Controls */}
          {gameStatus !== GameStatus.NotStarted && (
             <div className="flex justify-center items-center gap-4 mt-6">
                {gameStatus === GameStatus.PlayerTurn && (
                    <>
                        <button
                            onClick={handleRollDice}
                            disabled={!canRoll}
                            className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed"
                        >
                            {turnScore > 0 ? `Roll Again (${dice.length})` : `Roll Dice (6)`}
                        </button>
                        {turnScore > 0 && (
                            <button 
                                onClick={handleBankScore} 
                                disabled={!canBank}
                                className="bg-lime-600 hover:bg-lime-500 disabled:bg-stone-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed">
                                Bank Score
                            </button>
                        )}
                    </>
                )}
                {gameStatus === GameStatus.DiceRolled && (
                    <>
                        <button 
                            onClick={handleKeepDice} 
                            disabled={!canKeep}
                            className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed">
                            Keep & Roll
                        </button>
                        <button 
                            onClick={handleBankScore} 
                            disabled={!canBank}
                            className="bg-lime-600 hover:bg-lime-500 disabled:bg-stone-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed">
                            Bank Score
                        </button>
                    </>
                )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
