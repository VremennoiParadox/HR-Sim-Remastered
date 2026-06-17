import type { GameState, CompanyType, NewsTone } from './types';
import { clamp } from './engine';

export interface EventResult {
  message: string;
  tone: NewsTone;
  statChanges?: Partial<GameState['stats']>;
  moneyChange?: number;
  marketShareChange?: number;
  employeeChange?: number;
}

interface EventDef {
  id: string;
  check?: (state: GameState) => boolean;
  apply: (state: GameState) => EventResult | null;
}

function diffFactor(state: GameState): number {
  return state.difficulty === 'Easy' ? 0.5 : state.difficulty === 'Hard' ? 1.5 : 1.0;
}

const GENERIC_EVENTS: EventDef[] = [
  {
    id: 'strike',
    check: s => s.stats.morale < 40,
    apply: s => {
      const drop = Math.round(15 * diffFactor(s));
      return { message: `Strike! Low morale cost ${drop} productivity.`, tone: 'bad', statChanges: { productivity: clamp(s.stats.productivity - drop) } };
    },
  },
  {
    id: 'lawsuit',
    apply: s => {
      const loss = Math.round(5000 * diffFactor(s));
      return { message: `Lawsuit! Lost $${loss.toLocaleString()} and reputation.`, tone: 'bad', moneyChange: -loss, statChanges: { reputation: clamp(s.stats.reputation - 5) } };
    },
  },
  {
    id: 'big_order',
    apply: s => {
      const gain = Math.round(8000 * diffFactor(s));
      return { message: `Big order! Earned $${gain.toLocaleString()} and grew market share.`, tone: 'good', moneyChange: gain, marketShareChange: 2 };
    },
  },
  {
    id: 'competitor_attack',
    apply: s => {
      const topRival = Math.max(...s.rivals.map(r => r.marketShare));
      if (topRival > s.marketShare) {
        return { message: 'Competitor smear campaign hurt marketing & reputation.', tone: 'bad', statChanges: { marketing: clamp(s.stats.marketing - 10), reputation: clamp(s.stats.reputation - 5) } };
      }
      return { message: 'Competitor tried to attack, but we held strong!', tone: 'good' };
    },
  },
  {
    id: 'innovation_breakthrough',
    apply: s => ({
      message: 'Innovation breakthrough! Innovation & reputation up.', tone: 'good',
      statChanges: { innovation: clamp(s.stats.innovation + 10), reputation: clamp(s.stats.reputation + 3) },
    }),
  },
  {
    id: 'customer_complaint',
    apply: s => ({
      message: 'Customer complaints hit satisfaction & reputation.', tone: 'bad',
      statChanges: { customerSatisfaction: clamp(s.stats.customerSatisfaction - 10), reputation: clamp(s.stats.reputation - 2) },
    }),
  },
  {
    id: 'talent_poached',
    check: s => s.employees.length > 2,
    apply: () => ({
      message: 'A rival poached one of your best people!', tone: 'bad',
      employeeChange: -1, statChanges: {},
    }),
  },
  {
    id: 'market_boom',
    apply: () => ({
      message: 'Market boom! Gained market share and cash.', tone: 'good',
      marketShareChange: 3, moneyChange: 3000,
    }),
  },
  {
    id: 'economic_downturn',
    apply: () => ({
      message: 'Economic downturn dented sales.', tone: 'bad',
      moneyChange: -2000, marketShareChange: -1,
    }),
  },
];

const COMPANY_EVENTS: Record<CompanyType, EventDef[]> = {
  'Tech Startup': [
    {
      id: 'viral_product',
      apply: () => ({
        message: '🚀 Your product went viral! Massive market share boost!', tone: 'good',
        marketShareChange: 4, moneyChange: 6000,
        statChanges: { reputation: 80 },
      }),
    },
    {
      id: 'server_crash',
      apply: s => ({
        message: '💥 Server crash! Customers are furious, engineers scramble.', tone: 'bad',
        moneyChange: -3000,
        statChanges: { customerSatisfaction: clamp(s.stats.customerSatisfaction - 15), reputation: clamp(s.stats.reputation - 8) },
      }),
    },
  ],
  'Restaurant Chain': [
    {
      id: 'food_critic',
      apply: s => ({
        message: '⭐ A famous food critic gave you 5 stars!', tone: 'good',
        statChanges: { reputation: clamp(s.stats.reputation + 12), customerSatisfaction: clamp(s.stats.customerSatisfaction + 8) },
        marketShareChange: 2,
      }),
    },
    {
      id: 'health_inspection',
      apply: s => ({
        message: '🔍 Health inspection found violations. Costly repairs needed.', tone: 'bad',
        moneyChange: -4000,
        statChanges: { reputation: clamp(s.stats.reputation - 10) },
      }),
    },
  ],
  'Manufacturing': [
    {
      id: 'supply_deal',
      apply: () => ({
        message: '📦 Landed a huge supply chain deal! Efficiency soars.', tone: 'good',
        moneyChange: 7000,
        statChanges: { productivity: 75 },
      }),
    },
    {
      id: 'equipment_failure',
      apply: s => ({
        message: '⚠️ Major equipment breakdown. Production halted.', tone: 'bad',
        moneyChange: -5000,
        statChanges: { productivity: clamp(s.stats.productivity - 20) },
      }),
    },
  ],
  'Entertainment': [
    {
      id: 'blockbuster',
      apply: () => ({
        message: '🎬 Your latest production is a blockbuster hit!', tone: 'good',
        moneyChange: 10000, marketShareChange: 3,
        statChanges: { reputation: 85 },
      }),
    },
    {
      id: 'scandal',
      apply: s => ({
        message: '📰 Celebrity scandal! PR nightmare unfolds.', tone: 'bad',
        statChanges: { reputation: clamp(s.stats.reputation - 15), marketing: clamp(s.stats.marketing - 10) },
      }),
    },
  ],
};

export function rollRandomEvent(state: GameState): EventResult | null {
  const roll = Math.random();
  if (roll < 0.40) return null;

  // 20% chance of company-specific event
  if (roll > 0.80 && state.company) {
    const companyEvents = COMPANY_EVENTS[state.company];
    const evt = companyEvents[Math.floor(Math.random() * companyEvents.length)];
    if (!evt.check || evt.check(state)) {
      return evt.apply(state);
    }
  }

  const eligible = GENERIC_EVENTS.filter(e => !e.check || e.check(state));
  if (eligible.length === 0) return null;
  const evt = eligible[Math.floor(Math.random() * eligible.length)];
  return evt.apply(state);
}
