import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, CompanyType, LeadershipStyle, Difficulty, UpgradeName, DepartmentName, GameSpeed } from '../game/types';
import { createInitialState, startGame, monthlyTick, doAction, buyUpgrade, buyDepartment } from '../game/engine';
import { saveGame, loadGame, deleteSave } from '../game/storage';

const BASE_TICK_MS = 3000;

export function useGameLoop() {
  const [state, setState] = useState<GameState>(createInitialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback((speed: GameSpeed) => {
    clearTick();
    const ms = BASE_TICK_MS / speed;
    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.phase !== 'playing' || prev.paused) return prev;
        return monthlyTick(prev);
      });
    }, ms);
  }, [clearTick]);

  // Start/stop the interval when playing state changes
  useEffect(() => {
    if (state.phase === 'playing' && !state.paused) {
      startTick(state.speed);
    } else {
      clearTick();
    }
    return clearTick;
  }, [state.phase, state.paused, state.speed, startTick, clearTick]);

  // Auto-stop on game end
  useEffect(() => {
    if (state.phase === 'won' || state.phase === 'lost') {
      clearTick();
    }
  }, [state.phase, clearTick]);

  const handleStart = useCallback((company: CompanyType, leader: LeadershipStyle, difficulty: Difficulty) => {
    const tutorialSeen = localStorage.getItem('office-chaos-tutorial-seen') === 'true';
    setState(startGame(company, leader, difficulty, tutorialSeen));
  }, []);

  const handleLoadSave = useCallback(() => {
    const saved = loadGame();
    if (saved) {
      setState(saved);
    }
  }, []);

  const handleAction = useCallback((actionId: string) => {
    setState(prev => doAction(prev, actionId));
  }, []);

  const handleBuyUpgrade = useCallback((name: UpgradeName) => {
    setState(prev => buyUpgrade(prev, name));
  }, []);

  const handleBuyDepartment = useCallback((name: DepartmentName) => {
    setState(prev => buyDepartment(prev, name));
  }, []);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, paused: !prev.paused }));
  }, []);

  const handleSpeed = useCallback(() => {
    setState(prev => {
      const speeds: GameSpeed[] = [0.5, 1, 2];
      const idx = speeds.indexOf(prev.speed);
      return { ...prev, speed: speeds[(idx + 1) % speeds.length] };
    });
  }, []);

  const handleSave = useCallback(() => {
    saveGame(state);
  }, [state]);

  const handleRestart = useCallback(() => {
    clearTick();
    deleteSave();
    setState(createInitialState());
  }, [clearTick]);

  const handleDismissTutorial = useCallback(() => {
    localStorage.setItem('office-chaos-tutorial-seen', 'true');
    setState(prev => ({ ...prev, tutorialSeen: true }));
  }, []);

  return {
    state,
    handleStart,
    handleLoadSave,
    handleAction,
    handleBuyUpgrade,
    handleBuyDepartment,
    handlePause,
    handleSpeed,
    handleSave,
    handleRestart,
    handleDismissTutorial,
  };
}
