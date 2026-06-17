export type CompanyType = 'Tech Startup' | 'Restaurant Chain' | 'Manufacturing' | 'Entertainment';
export type LeadershipStyle = 'autocratic' | 'democratic' | 'laissez-faire';
export type Difficulty = 'Easy' | 'Normal' | 'Hard';
export type GameSpeed = 0.5 | 1 | 2;
export type GamePhase = 'start' | 'playing' | 'won' | 'lost';
export type NewsTone = 'good' | 'bad' | 'warn' | 'muted';

export interface Stats {
  morale: number;
  productivity: number;
  marketing: number;
  innovation: number;
  reputation: number;
  customerSatisfaction: number;
}

export type StatKey = keyof Stats;

export const STAT_META: { key: StatKey; label: string; icon: string }[] = [
  { key: 'morale', label: 'Morale', icon: '😊' },
  { key: 'productivity', label: 'Productivity', icon: '⚡' },
  { key: 'marketing', label: 'Marketing', icon: '📣' },
  { key: 'innovation', label: 'Innovation', icon: '💡' },
  { key: 'reputation', label: 'Reputation', icon: '⭐' },
  { key: 'customerSatisfaction', label: 'Customer Satisfaction', icon: '💖' },
];

export interface Employee {
  id: string;
  name: string;
  role: string;
  hiredMonth: number;
  hiredYear: number;
}

export interface Rival {
  name: string;
  marketShare: number;
  personality: 'aggressive' | 'steady' | 'underdog';
  icon: string;
}

export interface NewsItem {
  id: string;
  date: string;
  message: string;
  tone: NewsTone;
}

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

export type UpgradeName = 'Better Office' | 'Automation' | 'Coffee Machine' | 'Wellness Program' | 'AI Assistant';
export type DepartmentName = 'HR' | 'IT' | 'PR' | 'R&D Lab';

export interface UpgradeInfo {
  cost: number;
  desc: string;
  icon: string;
}

export interface DepartmentInfo {
  cost: number;
  desc: string;
  icon: string;
}

export interface GameState {
  phase: GamePhase;
  company: CompanyType | null;
  leaderStyle: LeadershipStyle;
  difficulty: Difficulty;
  speed: GameSpeed;
  paused: boolean;

  year: number;
  month: number;
  money: number;
  employees: Employee[];
  marketShare: number;

  stats: Stats;

  upgrades: Record<UpgradeName, boolean>;
  departments: Record<DepartmentName, boolean>;

  rivals: Rival[];
  news: NewsItem[];
  floatingTexts: FloatingText[];

  endMessage: string;
  tutorialSeen: boolean;
  totalMonths: number;
}

export const COMPANIES: Record<CompanyType, { desc: string; icon: string; bonus: string }> = {
  'Tech Startup': { desc: 'High innovation, fragile productivity', icon: '💻', bonus: '+10 Innovation, -5 Productivity' },
  'Restaurant Chain': { desc: 'Loyal customers, strong reputation', icon: '🍳', bonus: '+10 Satisfaction, +5 Reputation' },
  'Manufacturing': { desc: 'Productive but morale suffers', icon: '🏭', bonus: '+10 Productivity, -5 Morale' },
  'Entertainment': { desc: 'Marketing & reputation powerhouse', icon: '🎬', bonus: '+10 Marketing, +5 Reputation' },
};

export const LEADERSHIP: Record<LeadershipStyle, { desc: string; icon: string }> = {
  'autocratic': { desc: 'Productivity up, morale down', icon: '👔' },
  'democratic': { desc: 'Balanced morale & innovation', icon: '🤝' },
  'laissez-faire': { desc: 'Creative & happy, less output', icon: '🎨' },
};

export const DIFFICULTY_TARGETS: Record<Difficulty, number> = {
  Easy: 50,
  Normal: 70,
  Hard: 90,
};

export const UPGRADES: Record<UpgradeName, UpgradeInfo> = {
  'Better Office': { cost: 10000, desc: 'Morale +10 now, slower decay', icon: '🏢' },
  'Automation': { cost: 15000, desc: 'Productivity +15 now & +2/mo', icon: '🤖' },
  'Coffee Machine': { cost: 5000, desc: 'Halves morale decay', icon: '☕' },
  'Wellness Program': { cost: 8000, desc: 'Morale +8 now, satisfaction +3/mo', icon: '🧘' },
  'AI Assistant': { cost: 12000, desc: 'Innovation +10 now & +2/mo', icon: '🧠' },
};

export const DEPARTMENTS: Record<DepartmentName, DepartmentInfo> = {
  'HR': { cost: 8000, desc: '+3 Morale every month', icon: '👥' },
  'IT': { cost: 10000, desc: '+3 Productivity every month', icon: '🖥️' },
  'PR': { cost: 7000, desc: '+3 Reputation every month', icon: '📰' },
  'R&D Lab': { cost: 12000, desc: '+3 Innovation every month', icon: '🔬' },
};

export interface ActionDef {
  id: string;
  label: string;
  cost: number;
  icon: string;
  desc: string;
}

export const ACTIONS: ActionDef[] = [
  { id: 'training', label: 'Training', cost: 5000, icon: '📈', desc: 'Productivity +15' },
  { id: 'bonus', label: 'Bonuses', cost: 4000, icon: '🎁', desc: 'Morale +20' },
  { id: 'recruit', label: 'Recruit', cost: 3000, icon: '🧑‍💼', desc: '+1 Employee' },
  { id: 'marketing', label: 'Marketing Campaign', cost: 4000, icon: '📣', desc: 'Marketing +15, Rep +5' },
  { id: 'rnd', label: 'R&D Investment', cost: 6000, icon: '🔬', desc: 'Innovation +20' },
  { id: 'customer', label: 'Customer Service', cost: 2000, icon: '☎️', desc: 'Satisfaction +15, Rep +3' },
  { id: 'special', label: 'Special Ability', cost: 0, icon: '✨', desc: 'Based on leadership style' },
  { id: 'leadership', label: 'Change Leadership', cost: 0, icon: '🔁', desc: 'Cycle leadership style' },
];
