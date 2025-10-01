
import React, { useMemo, useEffect, useState } from 'react';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import { useAudioManager } from './hooks/useAudioManager';
import Die from './components/Die';
import Modal from './components/Modal';
import LobbyCreationScreen from './components/LobbyCreationScreen';
import LobbyScreen from './components/LobbyScreen';
import { GameStatus, Screen, DieValue } from './types';
import { GAME_MODES } from './constants';
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
    gameMode,
    rollDice,
    selectDie,
    keepDice,
    bankScore,
    handleFarkle,
    getCurrentPlayer,
    isMyTurn,
    winner,
  } = useMultiplayerGame();

  const { playMusic, startTavernMusic, stopAllMusic, playSoundEffect } = useAudioManager();

  // Always call hooks - compute game values even if not on game screen
  const dice = gameState?.dice || [];
  const keptDice = gameState?.keptDice || [];
  const turnScore = gameState?.turnScore || 0;
  const myTurn = isMyTurn();
  const currentPlayer = getCurrentPlayer();
  const [infoTab, setInfoTab] = useState<'scoreboard' | 'help'>('scoreboard');

  const selectedDice = useMemo(() => dice.filter(d => d.isSelected), [dice]);
  const unselectedDice = useMemo(() => dice.filter(d => !d.isSelected), [dice]);
  const scoreForSelection = useMemo(() => calculateScore(selectedDice.map(d => d.value)), [selectedDice]);
  const scoringExamples = useMemo(
    () => [
      {
        id: 'single-ones',
        title: 'Single 1s',
        summary: '100 pts each kept 1.',
        dice: [1] as DieValue[],
      },
      {
        id: 'single-fives',
        title: 'Single 5s',
        summary: '50 pts each kept 5.',
        dice: [5] as DieValue[],
      },
      {
        id: 'three-of-kind',
        title: 'Three of a Kind',
        summary: 'Value × 100 (1s = 1000).',
        dice: [1, 1, 1] as DieValue[],
      },
      {
        id: 'straight',
        title: 'Straight 1-6',
        summary: 'All six dice = 1500 pts.',
        dice: [1, 2, 3, 4, 5, 6] as DieValue[],
      },
    ],
    []
  );

  // Music management based on screen
  useEffect(() => {
    if (screen === Screen.LobbyCreation || screen === Screen.Lobby) {
      playMusic('lobby');
    } else if (screen === Screen.Game) {
      startTavernMusic();
    }
  }, [screen, playMusic, startTavernMusic]);

  // Play winner music when game ends
  useEffect(() => {
    if (winner) {
      playMusic('ending');
    }
  }, [winner, playMusic]);

  // Play farkle sound effect
  useEffect(() => {
    if (gameState?.gameStatus === 'DICE_ROLLED' && dice.length > 0 && checkForFarkle(dice.map(d => d.value))) {
      playSoundEffect('farkled');
    }
  }, [gameState?.gameStatus, dice, playSoundEffect]);

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
    playSoundEffect('diceroll');
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

  const renderExampleDice = (values: DieValue[], keyPrefix: string) => (
    <div className="flex justify-end flex-wrap gap-1 pointer-events-none">
      {values.map((value, index) => (
        <div key={`${keyPrefix}-${index}`} className="pointer-events-none w-8 h-8">
          <Die
            value={value}
            isSelected={false}
            isKept={false}
            isScoring
            showPlaceholder={false}
            onClick={() => {}}
            size="sm"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-900 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex items-center justify-center px-3 py-4 lg:px-6 lg:py-6 overflow-y-auto lg:overflow-hidden">
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

      <div className="w-full max-w-6xl mx-auto bg-stone-800/60 backdrop-blur-sm shadow-2xl rounded-xl border-4 border-amber-800 p-4 sm:p-6 lg:p-7 lg:h-[88vh] flex flex-col gap-4 lg:gap-6 lg:overflow-hidden">
        <header className="text-center lg:text-left">
          <h1 className="text-4xl font-bold text-amber-300 tracking-[0.35em]">FARKLE</h1>
          <p className="text-amber-200 text-sm sm:text-base">{GAME_MODES[gameMode].label} Mode - Score {GAME_MODES[gameMode].winningScore} points to win!</p>
          {currentPlayer && (
            <div className={`mt-2 text-base font-semibold ${myTurn ? 'text-lime-400' : 'text-amber-200'}`}>
              {myTurn ? 'YOUR TURN' : `${currentPlayer.nickname}'s Turn`}
            </div>
          )}
        </header>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6 flex-1 min-h-0">
          <section className="flex flex-col gap-4 lg:flex-1 min-h-0">
            <div className="bg-green-900/70 border-4 border-amber-600 rounded-lg p-4 sm:p-5 flex-1 min-h-0 flex flex-col gap-4 shadow-lg">
              <div>
                <h3 className="text-center text-amber-200 text-sm font-semibold mb-2">Kept Dice ({keptDice.length})</h3>
                <div className="flex justify-center items-center gap-3 min-h-[60px] bg-black/20 p-2 rounded">
                  {keptDice.length > 0 ? renderDice(keptDice, true) : <p className="text-stone-400 text-sm">No dice kept yet</p>}
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="text-center text-amber-200 text-sm font-semibold mb-2">Current Roll ({dice.length})</h3>
                <div className="flex flex-col gap-3 flex-1 min-h-0 justify-center">
                  {dice.length > 0 ? (
                    <>
                      <div className="flex flex-wrap justify-center items-center gap-3 min-h-[68px]">
                        {renderDice(unselectedDice)}
                      </div>
                      {selectedDice.length > 0 && (
                        <div className="flex flex-col gap-2 items-center">
                          <div className="h-px w-32 bg-amber-500/50" />
                          <p className="text-amber-200 text-xs uppercase tracking-[0.25em]">Selected</p>
                          <div className="flex flex-wrap justify-center items-center gap-3 min-h-[68px] mt-2">
                            {renderDice(selectedDice)}
                          </div>
                        </div>
                      )}
                    </>
                  ) : keptDice.length > 0 && keptDice.length < 6 ? (
                    <p className="text-stone-300 text-sm text-center">Roll the remaining dice!</p>
                  ) : (
                    <p className="text-stone-300 text-sm text-center">Ready to roll!</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3">
              {gameState.gameStatus === 'PLAYER_TURN' && (
                <>
                  <button
                    onClick={handleRollDice}
                    disabled={!canRoll}
                    className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 disabled:text-stone-400 font-bold py-2.5 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {turnScore > 0 ? `Roll Again (${dice.length || 6})` : 'Roll Dice (6)'}
                  </button>
                  {turnScore > 0 && (
                    <button
                      onClick={handleBankScore}
                      disabled={!canBank}
                      className="bg-lime-600 hover:bg-lime-500 disabled:bg-stone-600 text-white disabled:text-stone-400 font-bold py-2.5 px-5 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                    >
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
                    className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-stone-900 disabled:text-stone-400 font-bold py-2.5 px-5 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    Keep & Roll
                  </button>
                  <button
                    onClick={handleBankScore}
                    disabled={!canBank || !myTurn}
                    className="bg-lime-600 hover:bg-lime-500 disabled:bg-stone-600 text-white disabled:text-stone-400 font-bold py-2.5 px-5 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    Bank Score
                  </button>
                </>
              )}
            </div>
          </section>

          <aside className="bg-stone-900/70 border-4 border-amber-700 rounded-lg p-4 flex flex-col gap-4 min-h-0">
            <div className="bg-stone-900/80 border border-amber-700 rounded-lg p-1 flex items-center gap-1">
              <button
                onClick={() => setInfoTab('scoreboard')}
                className={`flex-1 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  infoTab === 'scoreboard'
                    ? 'bg-amber-500 text-stone-900'
                    : 'text-amber-200 hover:bg-amber-500/20'
                }`}
              >
                Scoreboard
              </button>
              <button
                onClick={() => setInfoTab('help')}
                className={`flex-1 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  infoTab === 'help'
                    ? 'bg-amber-500 text-stone-900'
                    : 'text-amber-200 hover:bg-amber-500/20'
                }`}
              >
                Help
              </button>
            </div>

            <div className="flex-1 min-h-0 w-full">
              {infoTab === 'scoreboard' ? (
                <div className="grid grid-cols-2 gap-3 h-full">
                  {players.map((player) => {
                    const isCurrentPlayer = gameState.currentPlayerTurn === player.id;
                    return (
                      <div
                        key={player.id}
                        className={`bg-stone-900/60 border-2 rounded-lg p-3 text-center transition-all flex flex-col items-center gap-2 ${isCurrentPlayer ? 'border-lime-500 shadow-lg shadow-lime-500/40' : 'border-amber-600/70'}`}
                      >
                        <div className={`bg-stone-800 border rounded-md p-1 transition-transform ${isCurrentPlayer ? 'border-lime-500 scale-105' : 'border-amber-600/80'}`}>
                          <img
                            src={`/images/farkle-avatar-${player.avatar}.png`}
                            alt={`${player.nickname}'s avatar`}
                            className="w-10 h-10 object-cover rounded"
                          />
                        </div>
                        <p className="text-amber-200 text-sm font-semibold truncate w-full">{player.nickname}</p>
                        <p className="text-2xl font-bold text-white">{player.score}</p>
                        {isCurrentPlayer && <p className="text-lime-400 text-xs uppercase tracking-wide">Playing</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-2 h-full">
                  {scoringExamples.map(example => (
                    <div
                      key={example.id}
                      className="bg-stone-900/70 border border-amber-700/60 rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                    >
                      <div className="text-left">
                        <p className="text-amber-200 text-xs font-semibold uppercase tracking-wide">{example.title}</p>
                        <p className="text-stone-300 text-xs">{example.summary}</p>
                      </div>
                      {renderExampleDice(example.dice, example.id)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-stone-900/80 border border-amber-700 rounded-lg px-4 py-3 text-center shadow-inner">
              <span className="text-xs uppercase tracking-[0.25em] text-amber-200">Turn Score</span>
              <span className="block text-3xl font-bold text-white">{turnScore}</span>
              {selectedDice.length > 0 && scoreForSelection > 0 && (
                <p className="text-lime-400 text-xs mt-1">+{scoreForSelection} if kept</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;
