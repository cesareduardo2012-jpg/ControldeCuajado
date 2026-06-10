export type CheeseType = {
  id: string;
  name: string;
  crossTime: number;
  breakCount: number;
  breakInterval: number;
  extractDelay: number;
  createdAt: string;
};

export type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibrate: boolean;
    advanceNotice: number; // minutes before to notify
  };
};

export type StepType = 'cross' | 'break' | 'extract';

export type ProcessStep = {
  id: string;
  type: StepType;
  title: string;
  scheduledTime: string;
  completed: boolean;
  completedAt?: string;
};

export type BatchStatus = 'active' | 'completed' | 'cancelled';

export type Batch = {
  id: string;
  cheeseTypeId: string;
  cheeseTypeName: string;
  batchName: string;
  startTime: string;
  status: BatchStatus;
  notes: string;
  milkLiters?: number;
  steps: ProcessStep[];
  endTime?: string;
  createdAt: string;
};
