import type {
  GameState, CompanyType, LeadershipStyle, Difficulty,
  Stats, UpgradeName, DepartmentName, NewsItem, FloatingText,
} from './types';
import { DIFFICULTY_TARGETS, UPGRADES, DEPARTMENTS } from './types';
import { generateEmployee, generateStartingTeam } from './employees';
import { generateRivals, tickRivals } from './rivals';
import { rollRandomEvent } from './events';

export function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

let _newsId = 0;
let _floatId = 0;

function makeNews(state: GameState, message: string, tone: NewsItem['tone']): NewsItem {
  return {
    id: `news_${++_newsId}`,
    date: `Y${state.year} M${String(state.month).padStart(2, ' ')}`,
    message,
    tone,
  };
}

export function createInitialState(): GameState {
  return {
    phase: 'start',
    company: null,
    leaderStyle: 'democratic',
    difficulty: 'Normal',
    speed: 1,
    paused: false,
    year: 1,
    month: 1,
    money: 20000,
    employees: [],
    marketShare: 10,
    stats: {
      morale: 50,
      productivity: 50,
      marketing: 50,
      innovation: 50,
      reputation: 50,
      customerSatisfaction: 50,
    },
    upgrades: {
      'Better Office': false,
      'Automation': false,
      'Coffee Machine': false,
      'Wellness Program': false,
      'AI Assistant': false,
    },
    departments: {
      'HR': false,
      'IT': false,
      'PR': false,
      'R&D Lab': false,
    },
    rivals: [],
    news: [],
    floatingTexts: [],
    endMessage: '',
    tutorialSeen: false,
    totalMonths: 0,
  };
}

export function startGame(
  company: CompanyType,
  leader: LeadershipStyle,
  difficulty: Difficulty,
  tutorialAlreadySeen: boolean,
): GameState {
  const state = createInitialState();
  state.phase = 'playing';
  state.company = company;
  state.leaderStyle = leader;
  state.difficulty = difficulty;
  state.tutorialSeen = tutorialAlreadySeen;

  if (difficulty === 'Easy') {
    state.money = 30000;
    state.marketShare = 15;
  } else if (difficulty === 'Hard') {
    state.money = 15000;
    state.marketShare = 5;
  }

  const s = state.stats;
  switch (company) {
    case 'Tech Startup':
      s.innovation = clamp(s.innovation + 10);
      s.productivity = clamp(s.productivity - 5);
      break;
    case 'Restaurant Chain':
      s.customerSatisfaction = clamp(s.customerSatisfaction + 10);
      s.reputation = clamp(s.reputation + 5);
      break;
    case 'Manufacturing':
      s.productivity = clamp(s.productivity + 10);
      s.morale = clamp(s.morale - 5);
      break;
    case 'Entertainment':
      s.marketing = clamp(s.marketing + 10);
      s.reputation = clamp(s.reputation + 5);
      break;
  }

  state.employees = generateStartingTeam(company, 10);
  state.rivals = generateRivals(difficulty);
  state.news = [makeNews(state, `${company} opens for business. Let's go!`, 'good')];

  return state;
}

export function calculateProfit(state: GameState): number {
  const { stats, employees } = state;
  const moraleFactor = stats.morale / 50;
  const repFactor = stats.reputation / 50;
  const satFactor = stats.customerSatisfaction / 50;
  const empCount = employees.length;

  let gross = (empCount * stats.productivity * 1.5) * moraleFactor * repFactor * satFactor;
  gross += stats.marketing * 4 + stats.innovation * 3;
  const salaries = empCount * 100;
  return Math.round(gross - salaries);
}

function applyLeadership(state: GameState): void {
  const s = state.stats;
  switch (state.leaderStyle) {
    case 'autocratic':
      s.productivity = clamp(s.productivity + 4);
      s.morale = clamp(s.morale - 3); // Reduced from -4 for balance
      break;
    case 'democratic':
      s.morale = clamp(s.morale + 3);
      s.innovation = clamp(s.innovation + 2);
      break;
    case 'laissez-faire':
      s.morale = clamp(s.morale + 3);
      s.productivity = clamp(s.productivity - 2);
      s.innovation = clamp(s.innovation + 3);
      break;
  }
}

function applyPassiveEffects(state: GameState): void {
  const s = state.stats;

  if (state.departments['HR']) s.morale = clamp(s.morale + 3);
  if (state.departments['IT']) s.productivity = clamp(s.productivity + 3);
  if (state.departments['PR']) s.reputation = clamp(s.reputation + 3);
  if (state.departments['R&D Lab']) s.innovation = clamp(s.innovation + 3);

  if (state.upgrades['Automation']) s.productivity = clamp(s.productivity + 2);
  if (state.upgrades['AI Assistant']) s.innovation = clamp(s.innovation + 2);
  if (state.upgrades['Wellness Program']) s.customerSatisfaction = clamp(s.customerSatisfaction + 3);

  // Morale decay — reduced base from 5→3 to prevent death spiral
  let moraleDecay = 3;
  if (state.upgrades['Coffee Machine']) moraleDecay = Math.max(1, Math.floor(moraleDecay / 2));
  if (state.upgrades['Better Office']) moraleDecay = Math.max(0, moraleDecay - 1);
  s.morale = clamp(s.morale - moraleDecay);

  s.customerSatisfaction = clamp(s.customerSatisfaction - 1); // Reduced from -2
  s.reputation = clamp(s.reputation - 1);
}

function computeMarketShareGrowth(state: GameState, profit: number): number {
  const s = state.stats;
  let growth = 0;
  growth += (s.marketing - 50) * 0.02;
  growth += (s.reputation - 50) * 0.015;
  growth += (s.customerSatisfaction - 50) * 0.015;
  growth += profit > 0 ? 0.5 : -0.5;
  growth -= 0.2; // Reduced competitor nibble from -0.25
  return growth;
}

export function monthlyTick(prev: GameState): GameState {
  if (prev.phase !== 'playing' || prev.paused) return prev;

  const state: GameState = JSON.parse(JSON.stringify(prev));
  state.floatingTexts = [];

  applyLeadership(state);

  const profit = calculateProfit(state);
  state.money += profit;

  applyPassiveEffects(state);

  // Low morale quit
  if (state.stats.morale < 20 && state.employees.length > 1) {
    state.employees.pop();
    state.news.push(makeNews(state, 'Morale is dangerously low — an employee quit!', 'bad'));
  }

  // Market share
  const growth = computeMarketShareGrowth(state, profit);
  state.marketShare = clamp(state.marketShare + growth, 0, 100);

  // Rivals
  state.rivals = tickRivals(state.rivals);

  // Random event
  const event = rollRandomEvent(state);
  if (event) {
    state.news.push(makeNews(state, event.message, event.tone));
    if (event.statChanges) {
      Object.assign(state.stats, event.statChanges);
    }
    if (event.moneyChange) state.money += event.moneyChange;
    if (event.marketShareChange) {
      state.marketShare = clamp(state.marketShare + event.marketShareChange, 0, 100);
    }
    if (event.employeeChange && event.employeeChange < 0 && state.employees.length > 1) {
      state.employees.pop();
    }
  }

  // Advance calendar
  state.month += 1;
  if (state.month > 12) {
    state.month = 1;
    state.year += 1;
  }
  state.totalMonths += 1;

  // Trim news to last 50
  if (state.news.length > 50) {
    state.news = state.news.slice(-50);
  }

  // Check end conditions
  const target = DIFFICULTY_TARGETS[state.difficulty];
  if (state.marketShare >= target) {
    state.phase = 'won';
    state.endMessage = `🏆 You reached ${target}% market share in Year ${state.year}, Month ${state.month}!`;
  } else if (state.money <= 0) {
    state.phase = 'lost';
    state.endMessage = '💸 Bankrupt! You ran out of money.';
  } else if (state.employees.length <= 0) {
    state.phase = 'lost';
    state.endMessage = '🚪 Everyone quit! No employees left.';
  } else if (state.stats.reputation <= 0) {
    state.phase = 'lost';
    state.endMessage = '📉 Your reputation is ruined!';
  }

  return state;
}

// --- Player Actions ---

export function addFloating(text: string, color: string): FloatingText {
  return { id: `float_${++_floatId}`, text, color, x: 0, y: 0 };
}

function canAfford(state: GameState, cost: number): boolean {
  return state.money >= cost;
}

export function doAction(prev: GameState, actionId: string): GameState {
  const state: GameState = JSON.parse(JSON.stringify(prev));
  const s = state.stats;
  const floats: FloatingText[] = [];

  const spend = (cost: number): boolean => {
    if (!canAfford(state, cost)) return false;
    state.money -= cost;
    return true;
  };

  switch (actionId) {
    case 'training':
      if (!spend(5000)) return prev;
      s.productivity = clamp(s.productivity + 15);
      state.news.push(makeNews(state, 'Training day! Productivity +15.', 'good'));
      floats.push(addFloating('+15 Productivity', '#34D399'));
      break;

    case 'bonus':
      if (!spend(4000)) return prev;
      s.morale = clamp(s.morale + 20);
      state.news.push(makeNews(state, 'Bonuses paid! Morale +20.', 'good'));
      floats.push(addFloating('+20 Morale', '#34D399'));
      break;

    case 'recruit':
      if (!spend(3000)) return prev;
      if (state.company) {
        state.employees.push(generateEmployee(state.company, state.year, state.month));
      }
      state.news.push(makeNews(state, 'New hire joined the team!', 'good'));
      floats.push(addFloating('+1 Employee', '#38BDF8'));
      break;

    case 'marketing':
      if (!spend(4000)) return prev;
      s.marketing = clamp(s.marketing + 15);
      s.reputation = clamp(s.reputation + 5);
      state.news.push(makeNews(state, 'Marketing campaign! Marketing +15, Reputation +5.', 'good'));
      floats.push(addFloating('+15 Marketing', '#34D399'));
      break;

    case 'rnd':
      if (!spend(6000)) return prev;
      s.innovation = clamp(s.innovation + 20);
      state.news.push(makeNews(state, 'R&D investment! Innovation +20.', 'good'));
      floats.push(addFloating('+20 Innovation', '#34D399'));
      break;

    case 'customer':
      if (!spend(2000)) return prev;
      s.customerSatisfaction = clamp(s.customerSatisfaction + 15);
      s.reputation = clamp(s.reputation + 3);
      state.news.push(makeNews(state, 'Customer service push! Satisfaction +15, Rep +3.', 'good'));
      floats.push(addFloating('+15 Satisfaction', '#34D399'));
      break;

    case 'special': {
      const style = state.leaderStyle;
      if (style === 'autocratic') {
        if (!spend(2000)) return prev;
        s.productivity = clamp(s.productivity + 10);
        s.morale = clamp(s.morale - 5);
        state.news.push(makeNews(state, 'Forced overtime! Productivity +10, Morale -5.', 'warn'));
        floats.push(addFloating('+10 Productivity', '#FBBF24'));
      } else if (style === 'democratic') {
        if (!spend(3000)) return prev;
        s.morale = clamp(s.morale + 15);
        s.innovation = clamp(s.innovation + 10);
        state.news.push(makeNews(state, 'Team-building retreat! Morale +15, Innovation +10.', 'good'));
        floats.push(addFloating('+15 Morale', '#34D399'));
      } else {
        s.innovation = clamp(s.innovation + 8);
        state.news.push(makeNews(state, 'Creative freedom day! Innovation +8 (free).', 'good'));
        floats.push(addFloating('+8 Innovation', '#34D399'));
      }
      break;
    }

    case 'leadership': {
      const styles: GameState['leaderStyle'][] = ['autocratic', 'democratic', 'laissez-faire'];
      const idx = styles.indexOf(state.leaderStyle);
      state.leaderStyle = styles[(idx + 1) % styles.length];
      state.news.push(makeNews(state, `Leadership style is now ${state.leaderStyle.charAt(0).toUpperCase() + state.leaderStyle.slice(1)}.`, 'warn'));
      floats.push(addFloating(`→ ${state.leaderStyle}`, '#FBBF24'));
      break;
    }
  }

  state.floatingTexts = floats;
  return state;
}

export function buyUpgrade(prev: GameState, name: UpgradeName): GameState {
  if (prev.upgrades[name]) return prev;
  const info = UPGRADES[name];
  if (!canAfford(prev, info.cost)) return prev;

  const state: GameState = JSON.parse(JSON.stringify(prev));
  state.money -= info.cost;
  state.upgrades[name] = true;

  if (name === 'Better Office') state.stats.morale = clamp(state.stats.morale + 10);
  if (name === 'Automation') state.stats.productivity = clamp(state.stats.productivity + 15);
  if (name === 'Wellness Program') state.stats.morale = clamp(state.stats.morale + 8);
  if (name === 'AI Assistant') state.stats.innovation = clamp(state.stats.innovation + 10);

  state.news.push(makeNews(state, `Bought upgrade: ${name}!`, 'good'));
  state.floatingTexts = [addFloating(`✓ ${name}`, '#34D399')];
  return state;
}

export function buyDepartment(prev: GameState, name: DepartmentName): GameState {
  if (prev.departments[name]) return prev;
  const info = DEPARTMENTS[name];
  if (!canAfford(prev, info.cost)) return prev;

  const state: GameState = JSON.parse(JSON.stringify(prev));
  state.money -= info.cost;
  state.departments[name] = true;

  state.news.push(makeNews(state, `Opened the ${name} department!`, 'good'));
  state.floatingTexts = [addFloating(`✓ ${name} Dept`, '#38BDF8')];
  return state;
}

export function getSpecialAbilityInfo(style: LeadershipStyle): { label: string; cost: number; desc: string } {
  switch (style) {
    case 'autocratic': return { label: 'Forced Overtime', cost: 2000, desc: 'Productivity +10, Morale -5' };
    case 'democratic': return { label: 'Team Retreat', cost: 3000, desc: 'Morale +15, Innovation +10' };
    case 'laissez-faire': return { label: 'Creative Freedom', cost: 0, desc: 'Innovation +8 (free!)' };
  }
}

export function getMarketShareTooltip(): string {
  return 'Market share grows when Marketing, Reputation, and Satisfaction are above 50. Positive profit also helps. Keep stats high and invest in marketing to win!';
}
