import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CheeseType, Batch, ProcessStep, AppSettings } from './types';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  loadCheeseTypes, saveCheeseTypes,
  loadBatches, saveBatches,
  loadAppSettings, saveAppSettings,
  generateSteps, generateId,
} from './store';
import { toast } from 'sonner';

type AppContextType = {
  cheeseTypes: CheeseType[];
  batches: Batch[];
  tick: number;
  appSettings: AppSettings;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  updateNotificationSettings: (settings: Partial<AppSettings['notifications']>) => void;
  addCheeseType: (ct: Omit<CheeseType, 'id' | 'createdAt'>) => void;
  updateCheeseType: (id: string, ct: Partial<CheeseType>) => void;
  deleteCheeseType: (id: string) => void;
  startBatch: (data: {
    cheeseTypeId: string;
    batchName: string;
    startTime: Date;
    notes: string;
    milkLiters?: number;
  }) => void;
  completeStep: (batchId: string, stepId: string) => void;
  postponeStep: (batchId: string, stepId: string, minutes: number) => void;
  completeBatch: (batchId: string) => void;
  cancelBatch: (batchId: string) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cheeseTypes, setCheeseTypes] = useState<CheeseType[]>(() => loadCheeseTypes());
  const [batches, setBatches] = useState<Batch[]>(() => loadBatches());
  const [appSettings, setAppSettings] = useState<AppSettings>(() => loadAppSettings());
  const [tick, setTick] = useState(0);
  const notifTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Live timer tick every second
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // Request notification permission
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.requestPermissions();
    } else {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Handle Theme
  useEffect(() => {
    let effectiveTheme = appSettings.theme;
    if (effectiveTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings.theme]);

  // Schedule/reschedule notifications whenever batches change
  useEffect(() => {
    // Clear existing web timers
    notifTimers.current.forEach(t => clearTimeout(t));
    notifTimers.current.clear();

    // Clear existing native timers
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.getPending().then(pending => {
        if (pending.notifications.length > 0) {
          LocalNotifications.cancel(pending);
        }
      });
    }

    if (!appSettings.notifications.enabled) return;

    batches.filter(b => b.status === 'active').forEach(batch => {
      batch.steps.filter(s => !s.completed).forEach(step => {
        const delay = new Date(step.scheduledTime).getTime() - Date.now() - (appSettings.notifications.advanceNotice * 60 * 1000);
        if (delay > 0) {
          const title = `${batch.batchName || 'Tambo'} - ${batch.cheeseTypeName}`;
          const body = appSettings.notifications.advanceNotice > 0 
            ? `Faltan ${appSettings.notifications.advanceNotice} minutos para: ${step.title}`
            : `Es momento de: ${step.title}`;
          
          if (Capacitor.isNativePlatform()) {
            // We need a numeric ID for the notification
            const numericId = Math.abs(parseInt(step.id.replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000));
            LocalNotifications.schedule({
              notifications: [
                {
                  title,
                  body,
                  id: numericId,
                  schedule: { at: new Date(Date.now() + delay) },
                }
              ]
            });
          } else {
            const timer = setTimeout(() => {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body, icon: '/favicon.ico' });
              }
              if (appSettings.notifications.vibrate && 'vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
              }
              if (appSettings.notifications.sound) {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.2);
              }

              toast(title, {
                description: body,
                duration: 30000,
                action: {
                  label: 'Ver',
                  onClick: () => {},
                },
              });
            }, delay);
            notifTimers.current.set(`${batch.id}_${step.id}`, timer);
          }
        }
      });
    });

    return () => {
      notifTimers.current.forEach(t => clearTimeout(t));
    };
  }, [batches, appSettings.notifications]);

  const persist = useCallback((updated: Batch[]) => {
    setBatches(updated);
    saveBatches(updated);
  }, []);

  const updateAppSettings = useCallback((settings: Partial<AppSettings>) => {
    setAppSettings(prev => {
      const next = { ...prev, ...settings };
      saveAppSettings(next);
      return next;
    });
  }, []);

  const updateNotificationSettings = useCallback((settings: Partial<AppSettings['notifications']>) => {
    setAppSettings(prev => {
      const next = { ...prev, notifications: { ...prev.notifications, ...settings } };
      saveAppSettings(next);
      return next;
    });
  }, []);

  const persistTypes = useCallback((updated: CheeseType[]) => {
    setCheeseTypes(updated);
    saveCheeseTypes(updated);
  }, []);

  const addCheeseType = useCallback((ct: Omit<CheeseType, 'id' | 'createdAt'>) => {
    persistTypes([...cheeseTypes, { ...ct, id: generateId(), createdAt: new Date().toISOString() }]);
  }, [cheeseTypes, persistTypes]);

  const updateCheeseType = useCallback((id: string, ct: Partial<CheeseType>) => {
    persistTypes(cheeseTypes.map(t => t.id === id ? { ...t, ...ct } : t));
  }, [cheeseTypes, persistTypes]);

  const deleteCheeseType = useCallback((id: string) => {
    persistTypes(cheeseTypes.filter(t => t.id !== id));
  }, [cheeseTypes, persistTypes]);

  const startBatch = useCallback((data: {
    cheeseTypeId: string;
    batchName: string;
    startTime: Date;
    notes: string;
    milkLiters?: number;
  }) => {
    const ct = cheeseTypes.find(t => t.id === data.cheeseTypeId);
    if (!ct) return;
    const steps = generateSteps(ct, data.startTime);
    const batch: Batch = {
      id: generateId(),
      cheeseTypeId: data.cheeseTypeId,
      cheeseTypeName: ct.name,
      batchName: data.batchName,
      startTime: data.startTime.toISOString(),
      status: 'active',
      notes: data.notes,
      milkLiters: data.milkLiters,
      steps,
      createdAt: new Date().toISOString(),
    };
    persist([...batches, batch]);
    toast.success(`Tambo iniciado: ${data.batchName || ct.name}`);
  }, [batches, cheeseTypes, persist]);

  const completeStep = useCallback((batchId: string, stepId: string) => {
    const updated = batches.map(b => {
      if (b.id !== batchId) return b;
      const updatedSteps = b.steps.map((s): ProcessStep =>
        s.id === stepId ? { ...s, completed: true, completedAt: new Date().toISOString() } : s
      );
      const allDone = updatedSteps.every(s => s.completed);
      return {
        ...b,
        steps: updatedSteps,
        status: allDone ? 'completed' as const : b.status,
        endTime: allDone ? new Date().toISOString() : b.endTime,
      };
    });
    persist(updated);
  }, [batches, persist]);

  const postponeStep = useCallback((batchId: string, stepId: string, minutes: number) => {
    const updated = batches.map(b => {
      if (b.id !== batchId) return b;
      return {
        ...b,
        steps: b.steps.map(s => {
          if (s.id !== stepId) return s;
          const newTime = new Date(new Date(s.scheduledTime).getTime() + minutes * 60 * 1000);
          return { ...s, scheduledTime: newTime.toISOString() };
        }),
      };
    });
    persist(updated);
    toast.info(`Paso pospuesto ${minutes} minutos`);
  }, [batches, persist]);

  const completeBatch = useCallback((batchId: string) => {
    const updated = batches.map(b =>
      b.id === batchId ? { ...b, status: 'completed' as const, endTime: new Date().toISOString() } : b
    );
    persist(updated);
    toast.success('Tambo completado');
  }, [batches, persist]);

  const cancelBatch = useCallback((batchId: string) => {
    const updated = batches.map(b =>
      b.id === batchId ? { ...b, status: 'cancelled' as const } : b
    );
    persist(updated);
    toast.info('Tambo cancelado');
  }, [batches, persist]);

  return (
    <AppContext.Provider value={{
      cheeseTypes, batches, tick, appSettings,
      updateAppSettings, updateNotificationSettings,
      addCheeseType, updateCheeseType, deleteCheeseType,
      startBatch, completeStep, postponeStep, completeBatch, cancelBatch,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
