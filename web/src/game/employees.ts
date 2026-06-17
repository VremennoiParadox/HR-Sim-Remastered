import type { Employee, CompanyType } from './types';

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Morgan', 'Casey', 'Quinn', 'Riley', 'Avery', 'Harper',
  'Sage', 'Phoenix', 'Rowan', 'Ellis', 'Blake', 'Drew', 'Lane', 'Reese',
  'Skyler', 'Tatum', 'Finley', 'Emery', 'Dakota', 'Marley', 'Remi', 'Kai',
  'Ari', 'Jules', 'Lennox', 'Oakley', 'Peyton', 'Rio', 'Shiloh', 'Wren',
  'Zion', 'Charlie', 'Frankie', 'Jamie', 'Kendall', 'Logan', 'Nico', 'Parker',
  'Sasha', 'Taylor', 'Val', 'Robin', 'Sam', 'Pat', 'Jesse', 'Cameron',
];

const LAST_NAMES = [
  'Chen', 'Park', 'Singh', 'Kim', 'Müller', 'Santos', 'Ahmed', 'Nakamura',
  'Williams', 'Brown', 'Garcia', 'Martinez', 'Anderson', 'Thomas', 'Jackson',
  'White', 'Harris', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
  'Rivera', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans',
];

const ROLES: Record<CompanyType, string[]> = {
  'Tech Startup': ['Engineer', 'Designer', 'Product Manager', 'DevOps', 'Data Scientist', 'QA Lead', 'Frontend Dev', 'Backend Dev'],
  'Restaurant Chain': ['Head Chef', 'Server', 'Manager', 'Sous Chef', 'Host', 'Bartender', 'Line Cook', 'Barista'],
  'Manufacturing': ['Operator', 'Supervisor', 'QC Inspector', 'Mechanic', 'Logistics Lead', 'Safety Officer', 'Welder', 'Foreman'],
  'Entertainment': ['Producer', 'Writer', 'Director', 'Editor', 'Sound Engineer', 'Marketing Lead', 'Talent Scout', 'Animator'],
};

let _counter = 0;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateEmployee(company: CompanyType, year: number, month: number): Employee {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const role = pick(ROLES[company]);
  return {
    id: `emp_${++_counter}_${Date.now()}`,
    name: `${first} ${last}`,
    role,
    hiredYear: year,
    hiredMonth: month,
  };
}

export function generateStartingTeam(company: CompanyType, count: number): Employee[] {
  return Array.from({ length: count }, () => generateEmployee(company, 1, 1));
}

export function getMoodEmoji(morale: number): string {
  if (morale >= 80) return '😄';
  if (morale >= 60) return '🙂';
  if (morale >= 40) return '😐';
  if (morale >= 20) return '😟';
  return '😡';
}
