export type MachineId = 'cutter' | 'sorter' | 'press' | 'kiln' | 'assembler' | 'cooler' | 'buffer' | 'splitter' | 'recycler';
export type Pace = 'lean' | 'steady' | 'brisk';
export type RunStatus = 'planning' | 'running' | 'paused' | 'won' | 'lost' | 'dismantling' | 'ending';

export interface Machine {
  id: MachineId;
  name: string;
  short: string;
  power: number;
  detail: string;
}

export interface Chapter {
  number: number;
  title: string;
  lesson: string;
  product: string;
  recipe: MachineId[];
  slots: number;
  available: MachineId[];
  powerCap?: number;
  constraint: string;
  validate: (route: MachineId[]) => string[];
}

export interface Contract {
  id: string;
  client: string;
  product: string;
  quota: number;
  mark: string;
}

export interface RunRecord {
  chapter: number;
  contract: string;
  produced: number;
  quota: number;
}

export interface GameState {
  version: 1;
  seed: number;
  chapterIndex: number;
  completedChapters: number;
  selectedContractId: string | null;
  route: Array<MachineId | null>;
  pace: Pace;
  status: RunStatus;
  remainingMs: number;
  produced: number;
  batchProgressMs: number;
  attempts: number;
  history: RunRecord[];
  updatedAt: number;
}

export const SHIFT_MS = 300_000;
export const BATCH_MS = 12_000;

export const MACHINES: Record<MachineId, Machine> = {
  cutter: { id: 'cutter', name: 'Cutter', short: 'CUT', power: 2, detail: 'Cuts raw sheet.' },
  sorter: { id: 'sorter', name: 'Sorter', short: 'SORT', power: 2, detail: 'Separates usable stock.' },
  press: { id: 'press', name: 'Press', short: 'PRESS', power: 3, detail: 'Shapes each part.' },
  kiln: { id: 'kiln', name: 'Kiln', short: 'HEAT', power: 4, detail: 'Hardens shaped parts.' },
  assembler: { id: 'assembler', name: 'Assembler', short: 'JOIN', power: 3, detail: 'Joins finished parts.' },
  cooler: { id: 'cooler', name: 'Cooling rack', short: 'COOL', power: 1, detail: 'Adds a safe heat gap.' },
  buffer: { id: 'buffer', name: 'Soft buffer', short: 'GAP', power: 1, detail: 'Separates heavy stations.' },
  splitter: { id: 'splitter', name: 'Splitter', short: 'SPLIT', power: 2, detail: 'Feeds two part sizes.' },
  recycler: { id: 'recycler', name: 'Recycler', short: 'LOOP', power: 1, detail: 'Collects scrap at route end.' }
};

function orderProblems(route: MachineId[], recipe: MachineId[]): string[] {
  let cursor = -1;
  for (const required of recipe) {
    const next = route.indexOf(required, cursor + 1);
    if (next === -1) return [`Put ${MACHINES[required].name} after ${cursor < 0 ? 'the input' : MACHINES[recipe[recipe.indexOf(required) - 1] as MachineId].name}.`];
    cursor = next;
  }
  return [];
}

function needsGap(route: MachineId[], first: MachineId, second: MachineId, gap: MachineId, message: string): string[] {
  const a = route.indexOf(first);
  const b = route.indexOf(second);
  if (a >= 0 && b >= 0 && !route.slice(a + 1, b).includes(gap)) return [message];
  return [];
}

export const CHAPTERS: Chapter[] = [
  {
    number: 1,
    title: 'Route the first order',
    lesson: 'Put each required machine in recipe order.',
    product: 'Flat brackets',
    recipe: ['cutter', 'press'],
    slots: 3,
    available: ['cutter', 'press', 'sorter'],
    constraint: 'Cut the sheet before pressing it.',
    validate: () => []
  },
  {
    number: 2,
    title: 'Make room for heat',
    lesson: 'Utility stations can satisfy a safety rule.',
    product: 'Fired tiles',
    recipe: ['cutter', 'kiln', 'press'],
    slots: 4,
    available: ['cutter', 'kiln', 'cooler', 'press', 'sorter'],
    constraint: 'Place a cooling rack between the kiln and press.',
    validate: (route) => needsGap(route, 'kiln', 'press', 'cooler', 'The cooling rack must sit between the kiln and press.')
  },
  {
    number: 3,
    title: 'Stay under the power cap',
    lesson: 'Pace changes both output and power use.',
    product: 'Switch housings',
    recipe: ['sorter', 'press', 'assembler'],
    slots: 4,
    available: ['sorter', 'press', 'assembler', 'cooler', 'kiln'],
    powerCap: 9,
    constraint: 'The route may use at most 9 kW at its chosen pace.',
    validate: () => []
  },
  {
    number: 4,
    title: 'Protect fragile stock',
    lesson: 'Heavy stations need a soft gap.',
    product: 'Ceramic relays',
    recipe: ['sorter', 'press', 'kiln', 'assembler'],
    slots: 5,
    available: ['sorter', 'press', 'buffer', 'kiln', 'assembler', 'cooler'],
    constraint: 'Place a soft buffer between the press and kiln.',
    validate: (route) => needsGap(route, 'press', 'kiln', 'buffer', 'The soft buffer must sit between the press and kiln.')
  },
  {
    number: 5,
    title: 'Close the scrap loop',
    lesson: 'The last station decides where waste goes.',
    product: 'Split clamps',
    recipe: ['cutter', 'splitter', 'press', 'assembler', 'recycler'],
    slots: 5,
    available: ['cutter', 'splitter', 'press', 'assembler', 'recycler', 'buffer'],
    powerCap: 14,
    constraint: 'The recycler must be the final active station.',
    validate: (route) => route.at(-1) === 'recycler' ? [] : ['Put the recycler at the end of the route.']
  },
  {
    number: 6,
    title: 'Run the final machine',
    lesson: 'Use every station, then dismantle the line.',
    product: 'Foundry cores',
    recipe: ['cutter', 'sorter', 'press', 'kiln', 'assembler', 'recycler'],
    slots: 6,
    available: ['cutter', 'sorter', 'press', 'kiln', 'assembler', 'recycler'],
    powerCap: 15,
    constraint: 'Use all six stations in recipe order within 15 kW.',
    validate: (route) => route.length === 6 ? [] : ['Fill all six route slots.']
  }
];

const CLIENTS = [
  ['North Quay Repairs', 'Moss Street Hardware', 'Civic Sign Shop', 'Canal Lock Works', 'Hilltop Radio Club'],
  ['Field Oven Co-op', 'Red Clay Studio', 'Juniper Kitchen', 'East Ward School', 'Harbor Tile Crew'],
  ['Night Bus Depot', 'Public Bell Lab', 'River Gauge Office', 'Corner Lamp Works', 'West Line Signals'],
  ['Archive Drawer Guild', 'Small Clock Museum', 'Map Case Makers', 'Marsh Weather Lab', 'Town Hall Workshop'],
  ['Loop Bicycle Works', 'Canal Tool Library', 'Market Stall Union', 'Old Pier Repair', 'Community Greenhouse'],
  ['Last Light Observatory', 'Terminus Print Room', 'Foundry Record Office', 'Sixth Street Workshop', 'Winter Pump House']
];

export function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6D2B79F5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function contractsForChapter(seed: number, chapterIndex: number): Contract[] {
  const random = seededRandom(seed + chapterIndex * 7919);
  const names = [...(CLIENTS[chapterIndex] ?? CLIENTS[0]!)].sort(() => random() - 0.5).slice(0, 3);
  const quotas = [20, 23, 27].sort(() => random() - 0.5);
  const marks = ['●', '▲', '■'];
  return names.map((client, index) => ({
    id: `${chapterIndex + 1}-${index}-${client.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    client,
    product: CHAPTERS[chapterIndex]?.product ?? 'Parts',
    quota: quotas[index] ?? 23,
    mark: marks[index] ?? '●'
  }));
}

export function createGame(seed = Math.floor(Date.now() / 1000), demo = false): GameState {
  const chapterIndex = demo ? 1 : 0;
  const demoContract = contractsForChapter(seed, chapterIndex)[0];
  return {
    version: 1,
    seed,
    chapterIndex,
    completedChapters: demo ? 1 : 0,
    selectedContractId: demoContract?.id ?? null,
    route: demo ? ['cutter', 'kiln', 'cooler', 'press'] : Array(CHAPTERS[0]!.slots).fill(null),
    pace: 'steady',
    status: 'planning',
    remainingMs: SHIFT_MS,
    produced: 0,
    batchProgressMs: 0,
    attempts: 0,
    history: [],
    updatedAt: Date.now()
  };
}

export function activeRoute(state: GameState): MachineId[] {
  return state.route.filter((machine): machine is MachineId => machine !== null);
}

export function paceMultiplier(pace: Pace): number {
  return pace === 'lean' ? 0.84 : pace === 'brisk' ? 1.16 : 1;
}

export function routePower(state: GameState): number {
  const base = activeRoute(state).reduce((sum, id) => sum + MACHINES[id].power, 0);
  return Math.round(base * paceMultiplier(state.pace) * 10) / 10;
}

export function validatePlan(state: GameState): string[] {
  const chapter = CHAPTERS[state.chapterIndex];
  if (!chapter) return ['This chapter could not be loaded. Start a new campaign.'];
  const route = activeRoute(state);
  const problems = orderProblems(route, chapter.recipe);
  problems.push(...chapter.validate(route));
  if (chapter.powerCap !== undefined && routePower(state) > chapter.powerCap) {
    problems.push(`Power use is ${routePower(state)} kW. Choose a route and pace at or below ${chapter.powerCap} kW.`);
  }
  return problems;
}

export function forecastOutput(state: GameState): number {
  return Math.floor((SHIFT_MS / BATCH_MS) * paceMultiplier(state.pace));
}

export function selectedContract(state: GameState): Contract | undefined {
  return contractsForChapter(state.seed, state.chapterIndex).find((contract) => contract.id === state.selectedContractId);
}

export function stepSimulation(state: GameState, simulatedMs: number): GameState {
  if (state.status !== 'running' || simulatedMs <= 0) return state;
  const next = { ...state };
  const step = Math.min(simulatedMs, next.remainingMs);
  next.remainingMs -= step;
  next.batchProgressMs += step;
  while (next.batchProgressMs >= BATCH_MS) {
    next.batchProgressMs -= BATCH_MS;
    next.produced += paceMultiplier(next.pace);
  }
  if (next.remainingMs <= 0) {
    next.remainingMs = 0;
    const contract = selectedContract(next);
    next.status = contract && Math.floor(next.produced) >= contract.quota ? 'won' : 'lost';
  }
  next.updatedAt = Date.now();
  return next;
}

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

export function nextChapter(state: GameState): GameState {
  const contract = selectedContract(state);
  const history = contract ? [...state.history, {
    chapter: state.chapterIndex + 1,
    contract: contract.client,
    produced: Math.floor(state.produced),
    quota: contract.quota
  }] : state.history;
  if (state.chapterIndex === CHAPTERS.length - 1) {
    return { ...state, status: 'dismantling', history, completedChapters: 6, updatedAt: Date.now() };
  }
  const chapterIndex = state.chapterIndex + 1;
  return {
    ...state,
    chapterIndex,
    completedChapters: Math.max(state.completedChapters, chapterIndex),
    selectedContractId: null,
    route: Array(CHAPTERS[chapterIndex]!.slots).fill(null),
    pace: 'steady',
    status: 'planning',
    remainingMs: SHIFT_MS,
    produced: 0,
    batchProgressMs: 0,
    history,
    updatedAt: Date.now()
  };
}
