import { useEffect, useRef, useCallback } from 'react';

type MusicTrack = 'lobby' | 'tavern1' | 'tavern2' | 'ending';
type SoundEffect = 'diceroll' | 'farkled';

export const useAudioManager = () => {
  // Music refs
  const lobbyMusicRef = useRef<HTMLAudioElement | null>(null);
  const tavern1MusicRef = useRef<HTMLAudioElement | null>(null);
  const tavern2MusicRef = useRef<HTMLAudioElement | null>(null);
  const endingMusicRef = useRef<HTMLAudioElement | null>(null);

  // SFX refs
  const dicerollSfxRef = useRef<HTMLAudioElement | null>(null);
  const farkledSfxRef = useRef<HTMLAudioElement | null>(null);

  // State tracking
  const currentMusicRef = useRef<HTMLAudioElement | null>(null);
  const isTavernCyclingRef = useRef<boolean>(false);

  // Initialize audio elements
  useEffect(() => {
    // Music
    lobbyMusicRef.current = new Audio('/audio/lobby.mp3');
    lobbyMusicRef.current.loop = true;
    lobbyMusicRef.current.volume = 0.5;

    tavern1MusicRef.current = new Audio('/audio/tavern1.mp3');
    tavern1MusicRef.current.volume = 0.35;

    tavern2MusicRef.current = new Audio('/audio/tavern2.mp3');
    tavern2MusicRef.current.volume = 0.35;

    endingMusicRef.current = new Audio('/audio/ending.mp3');
    endingMusicRef.current.volume = 0.6;

    // SFX
    dicerollSfxRef.current = new Audio('/audio/diceroll.mp3');
    dicerollSfxRef.current.volume = 0.7;

    farkledSfxRef.current = new Audio('/audio/farkled.mp3');
    farkledSfxRef.current.volume = 0.8;

    // Cleanup on unmount
    return () => {
      lobbyMusicRef.current?.pause();
      tavern1MusicRef.current?.pause();
      tavern2MusicRef.current?.pause();
      endingMusicRef.current?.pause();
      dicerollSfxRef.current?.pause();
      farkledSfxRef.current?.pause();
    };
  }, []);

  // Stop all music
  const stopAllMusic = useCallback(() => {
    if (lobbyMusicRef.current) {
      lobbyMusicRef.current.pause();
      lobbyMusicRef.current.currentTime = 0;
    }
    if (tavern1MusicRef.current) {
      tavern1MusicRef.current.pause();
      tavern1MusicRef.current.currentTime = 0;
    }
    if (tavern2MusicRef.current) {
      tavern2MusicRef.current.pause();
      tavern2MusicRef.current.currentTime = 0;
    }
    if (endingMusicRef.current) {
      endingMusicRef.current.pause();
      endingMusicRef.current.currentTime = 0;
    }
    currentMusicRef.current = null;
    isTavernCyclingRef.current = false;
  }, []);

  // Play music
  const playMusic = useCallback((track: MusicTrack) => {
    // Don't restart if already playing this track
    if (track === 'lobby' && currentMusicRef.current === lobbyMusicRef.current && !lobbyMusicRef.current?.paused) {
      return;
    }

    stopAllMusic();

    let audioElement: HTMLAudioElement | null = null;

    switch (track) {
      case 'lobby':
        audioElement = lobbyMusicRef.current;
        break;
      case 'tavern1':
        audioElement = tavern1MusicRef.current;
        break;
      case 'tavern2':
        audioElement = tavern2MusicRef.current;
        break;
      case 'ending':
        audioElement = endingMusicRef.current;
        break;
    }

    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(err => {
        console.warn('Audio playback failed:', err);
      });
      currentMusicRef.current = audioElement;
    }
  }, [stopAllMusic]);

  // Start tavern music cycling
  const startTavernMusic = useCallback(() => {
    if (isTavernCyclingRef.current) return;

    isTavernCyclingRef.current = true;

    // Randomly choose which tavern track to start with
    const startWithTavern1 = Math.random() < 0.5;
    const firstTrack = startWithTavern1 ? tavern1MusicRef.current : tavern2MusicRef.current;
    const secondTrack = startWithTavern1 ? tavern2MusicRef.current : tavern1MusicRef.current;

    const cycleMusic = (current: HTMLAudioElement | null, next: HTMLAudioElement | null) => {
      if (!current || !next) return;

      current.onended = () => {
        if (!isTavernCyclingRef.current) return;
        next.currentTime = 0;
        next.play().catch(err => console.warn('Audio playback failed:', err));
        currentMusicRef.current = next;
        cycleMusic(next, current);
      };
    };

    if (firstTrack && secondTrack) {
      stopAllMusic();
      isTavernCyclingRef.current = true;
      firstTrack.currentTime = 0;
      firstTrack.play().catch(err => console.warn('Audio playback failed:', err));
      currentMusicRef.current = firstTrack;
      cycleMusic(firstTrack, secondTrack);
    }
  }, [stopAllMusic]);

  // Play sound effect
  const playSoundEffect = useCallback((sfx: SoundEffect) => {
    let audioElement: HTMLAudioElement | null = null;

    switch (sfx) {
      case 'diceroll':
        audioElement = dicerollSfxRef.current;
        break;
      case 'farkled':
        audioElement = farkledSfxRef.current;
        break;
    }

    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(err => {
        console.warn('Sound effect playback failed:', err);
      });
    }
  }, []);

  return {
    playMusic,
    startTavernMusic,
    stopAllMusic,
    playSoundEffect,
  };
};
