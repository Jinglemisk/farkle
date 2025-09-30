
import { useState, useCallback } from 'react';
import { Die, DieValue, GameStatus } from '../types';
import { DICE_COUNT, WINNING_SCORE } from '../constants';
import { calculateScore, checkForFarkle } from '../utils/scoring';

const createInitialDice = (): Die[] => {
    return Array.from({ length: DICE_COUNT }, (_, i) => ({
        id: i,
        value: 1,
        isSelected: false
    }));
};

export const useFarkleGame = () => {
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.NotStarted);
    const [dice, setDice] = useState<Die[]>(createInitialDice());
    const [keptDice, setKeptDice] = useState<Die[]>([]);
    const [totalScore, setTotalScore] = useState(0);
    const [turnScore, setTurnScore] = useState(0);

    const startTurn = useCallback(() => {
        setTurnScore(0);
        setDice(createInitialDice());
        setKeptDice([]);
        setGameStatus(GameStatus.PlayerTurn);
    }, []);

    const handleNewGame = useCallback(() => {
        setTotalScore(0);
        startTurn();
    }, [startTurn]);

    const handleRollDice = useCallback(() => {
        const numToRoll = dice.length === 0 ? DICE_COUNT : dice.length;
        const newDice = Array.from({ length: numToRoll }, (_, i) => {
            const oldDie = dice[i] || { id: keptDice.length + i, isSelected: false };
            return {
                ...oldDie,
                value: (Math.floor(Math.random() * 6) + 1) as DieValue,
                isSelected: false
            };
        });

        const newDiceValues = newDice.map(d => d.value);
        if (checkForFarkle(newDiceValues)) {
            setDice(newDice);
            setGameStatus(GameStatus.GameOverFarkle);
            // The modal will call the next action
        } else {
            setDice(newDice);
            setGameStatus(GameStatus.DiceRolled);
        }
    }, [dice, keptDice.length]);
    
    const handleFarkleAck = useCallback(() => {
        if (totalScore >= WINNING_SCORE) {
            setGameStatus(GameStatus.GameOverWin);
        } else {
            startTurn();
        }
    }, [startTurn, totalScore]);


    const handleSelectDie = useCallback((id: number) => {
        setDice(prevDice =>
            prevDice.map(d =>
                d.id === id ? { ...d, isSelected: !d.isSelected } : d
            )
        );
    }, []);

    const handleKeepDice = useCallback(() => {
        const selectedDice = dice.filter(d => d.isSelected);
        const remainingDice = dice.filter(d => !d.isSelected);

        const scoreForSelection = calculateScore(selectedDice.map(d => d.value));

        if (scoreForSelection === 0) {
            // Invalid selection, do nothing or provide feedback
            return;
        }

        const newKeptDice = [...keptDice, ...selectedDice.map(d => ({ ...d, isSelected: false }))];
        setKeptDice(newKeptDice);
        setTurnScore(prev => prev + scoreForSelection);
        
        // Hot Dice condition
        if (newKeptDice.length === DICE_COUNT) {
            setDice(createInitialDice());
            setKeptDice([]); // Reset kept dice for another full roll
            setGameStatus(GameStatus.PlayerTurn);
        } else {
            setDice(remainingDice);
            setGameStatus(GameStatus.PlayerTurn);
        }
    }, [dice, keptDice]);

    const handleBankScore = useCallback(() => {
        let finalTurnScore = turnScore;

        // If banking from a fresh roll, calculate score of selected dice and add it.
        if (gameStatus === GameStatus.DiceRolled) {
            const selectedDice = dice.filter(d => d.isSelected);
            const scoreForSelection = calculateScore(selectedDice.map(d => d.value));
            finalTurnScore += scoreForSelection;
        }

        const newTotalScore = totalScore + finalTurnScore;
        setTotalScore(newTotalScore);
        if (newTotalScore >= WINNING_SCORE) {
            setGameStatus(GameStatus.GameOverWin);
        } else {
            startTurn();
        }
    }, [totalScore, turnScore, startTurn, gameStatus, dice]);
    
    const modalAction = gameStatus === GameStatus.GameOverFarkle ? handleFarkleAck : handleNewGame;

    return {
        gameStatus,
        dice,
        keptDice,
        totalScore,
        turnScore,
        handleNewGame: gameStatus === GameStatus.GameOverFarkle ? handleFarkleAck : handleNewGame,
        handleRollDice,
        handleSelectDie,
        handleKeepDice,
        handleBankScore
    };
};
