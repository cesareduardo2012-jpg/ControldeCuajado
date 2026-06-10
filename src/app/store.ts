import { CheeseType, Batch, ProcessStep, AppSettings } from './types';

const CHEESE_TYPES_KEY = 'queseria_cheese_types';
const BATCHES_KEY = 'queseria_batches';
const APP_SETTINGS_KEY = 'queseria_app_settings';

export const DEFAULT_CHEESE_TYPES: CheeseType[] = [
  { id: 'ct1', name: 'Queso Asadero', crossTime: 20, breakCount: 3, breakInterval: 20, extractDelay: 20, createdAt: new Date().toISOString() },
  { id: 'ct2', name: 'Queso Oreado', crossTime: 25, breakCount: 4, breakInterval: 15, extractDelay: 30, createdAt: new Date().toISOString() },
  { id: 'ct3', name: 'Queso Fresco', crossTime: 15, breakCount: 2, breakInterval: 15, extractDelay: 15, createdAt: new Date().toISOString() },
  { id: 'ct4', name: 'Queso Panela', crossTime: 20, breakCount: 2, breakInterval: 20, extractDelay: 25, createdAt: new Date().toISOString() },
];

export function loadCheeseTypes(): CheeseType[] {
  try {
    const raw = localStorage.getItem(CHEESE_TYPES_KEY);
    if (!raw) {
      localStorage.setItem(CHEESE_TYPES_KEY, JSON.stringify(DEFAULT_CHEESE_TYPES));
      return DEFAULT_CHEESE_TYPES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CHEESE_TYPES;
  }
}

export function saveCheeseTypes(types: CheeseType[]): void {
  localStorage.setItem(CHEESE_TYPES_KEY, JSON.stringify(types));
}

export function loadBatches(): Batch[] {
  try {
    const raw = localStorage.getItem(BATCHES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBatches(batches: Batch[]): void {
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  notifications: {
    enabled: true,
    sound: true,
    vibrate: true,
    advanceNotice: 0,
  }
};

export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme || DEFAULT_APP_SETTINGS.theme,
      notifications: { ...DEFAULT_APP_SETTINGS.notifications, ...parsed.notifications }
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
}

export function generateSteps(cheeseType: CheeseType, startTime: Date): ProcessStep[] {
  const steps: ProcessStep[] = [];
  const addMinutes = (base: Date, mins: number) =>
    new Date(base.getTime() + mins * 60 * 1000).toISOString();

  let elapsed = cheeseType.crossTime;

  steps.push({
    id: `step_cross_${Date.now()}`,
    type: 'cross',
    title: 'Cruzar la cuajada',
    scheduledTime: addMinutes(startTime, elapsed),
    completed: false,
  });

  for (let i = 1; i <= cheeseType.breakCount; i++) {
    elapsed += cheeseType.breakInterval;
    const ordinal = i === 1 ? 'Primera' : i === 2 ? 'Segunda' : i === 3 ? 'Tercera' : `${i}a`;
    steps.push({
      id: `step_break_${i}_${Date.now() + i}`,
      type: 'break',
      title: `${ordinal} quebrada`,
      scheduledTime: addMinutes(startTime, elapsed),
      completed: false,
    });
  }

  elapsed += cheeseType.extractDelay;
  steps.push({
    id: `step_extract_${Date.now() + 99}`,
    type: 'extract',
    title: 'Sacar a bolsas',
    scheduledTime: addMinutes(startTime, elapsed),
    completed: false,
  });

  return steps;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSecs = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) return `${hrs}h ${String(mins).padStart(2, '0')}m`;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getStepStatus(scheduledTime: string, completed: boolean) {
  if (completed) return 'completed';
  const diff = new Date(scheduledTime).getTime() - Date.now();
  if (diff < 0) return 'overdue';
  if (diff < 5 * 60 * 1000) return 'soon';
  return 'pending';
}
