import type { GameState } from './types';

const SAVE_KEY = 'office-chaos-save';

export function saveGame(state: GameState): void {
  try {
    const data = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, data);
  } catch {
    // Storage full or unavailable
  }
}

export function loadGame(): GameState | null {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    return JSON.parse(data) as GameState;
  } catch {
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}
