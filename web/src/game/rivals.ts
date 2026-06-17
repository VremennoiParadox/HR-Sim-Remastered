import type { Rival, Difficulty } from './types';

interface RivalTemplate {
  name: string;
  personality: Rival['personality'];
  icon: string;
  baseShare: number;
}

const RIVAL_POOL: RivalTemplate[] = [
  { name: 'Nexus Corp', personality: 'aggressive', icon: '🦈', baseShare: 18 },
  { name: 'Pinnacle Inc', personality: 'steady', icon: '🏔️', baseShare: 22 },
  { name: 'Spark Labs', personality: 'underdog', icon: '⚡', baseShare: 12 },
  { name: 'Titan Group', personality: 'aggressive', icon: '🐉', baseShare: 25 },
  { name: 'Horizon Co', personality: 'steady', icon: '🌅', baseShare: 15 },
  { name: 'Wildcard Ltd', personality: 'underdog', icon: '🃏', baseShare: 8 },
];

export function generateRivals(difficulty: Difficulty): Rival[] {
  const shuffled = [...RIVAL_POOL].sort(() => Math.random() - 0.5);
  const count = difficulty === 'Hard' ? 3 : 2;
  return shuffled.slice(0, count).map(t => ({
    name: t.name,
    marketShare: t.baseShare + (difficulty === 'Hard' ? 5 : difficulty === 'Easy' ? -3 : 0),
    personality: t.personality,
    icon: t.icon,
  }));
}

export function tickRivals(rivals: Rival[]): Rival[] {
  return rivals.map(r => {
    let growth: number;
    switch (r.personality) {
      case 'aggressive':
        growth = 0.3 + Math.random() * 1.2;
        break;
      case 'steady':
        growth = 0.2 + Math.random() * 0.8;
        break;
      case 'underdog':
        growth = Math.random() < 0.3 ? 1.0 + Math.random() * 2.0 : -0.2 + Math.random() * 0.5;
        break;
    }
    return { ...r, marketShare: Math.max(1, Math.min(60, r.marketShare + growth)) };
  });
}
