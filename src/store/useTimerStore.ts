import { AppState, AppStateStatus } from 'react-native';
import { create } from 'zustand';

interface TimerState {
  activeTaskId: number | null;
  activeTaskName: string | null;
  activeMode: 'stopwatch' | 'timer' | null;
  targetDuration: number;
  elapsedSeconds: number;
  isPaused: boolean;

  sessionStartTime: number | null;
  initialStartTime: number | null;
  accumulatedSeconds: number;

  startTimer: (
    taskId: number,
    taskName: string,
    mode?: 'stopwatch' | 'timer',
    targetDuration?: number,
  ) => void;
  stopTimer: () => {
    taskId: number;
    taskName: string | null;
    seconds: number;
    startTime: number;
    endTime: number;
  } | null;
  togglePause: () => void;

  // Internal actions
  updateTick: () => void;
  handleAppStateChange: (nextAppState: AppStateStatus) => void;
}

// Keep the interval reference outside so it doesn't cause re-renders/complications
let timerInterval: NodeJS.Timeout | null = null;
let appStateSubscription: any = null;

export const useTimerStore = create<TimerState>((set, get) => ({
  activeTaskId: null,
  activeTaskName: null,
  activeMode: null,
  targetDuration: 0,
  elapsedSeconds: 0,
  isPaused: false,
  sessionStartTime: null,
  initialStartTime: null,
  accumulatedSeconds: 0,

  updateTick: () => {
    const { activeTaskId, isPaused, sessionStartTime, accumulatedSeconds } = get();
    if (activeTaskId && !isPaused && sessionStartTime) {
      const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      set({ elapsedSeconds: accumulatedSeconds + currentElapsed });
    }
  },

  handleAppStateChange: (nextAppState) => {
    const { activeTaskId, isPaused, sessionStartTime, accumulatedSeconds } = get();
    if (nextAppState === 'active' && activeTaskId && !isPaused && sessionStartTime) {
      const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      set({ elapsedSeconds: accumulatedSeconds + currentElapsed });
    }
  },

  startTimer: (taskId, taskName, mode = 'stopwatch', targetDuration = 0) => {
    const { activeTaskId, isPaused } = get();

    if (activeTaskId === taskId) {
      if (isPaused) {
        set({ sessionStartTime: Date.now(), isPaused: false });
        if (!timerInterval) {
          timerInterval = setInterval(() => get().updateTick(), 1000) as any;
        }
      }
      return;
    }

    const now = Date.now();
    set({
      activeTaskId: taskId,
      activeTaskName: taskName,
      activeMode: mode,
      targetDuration: targetDuration,
      sessionStartTime: now,
      initialStartTime: now,
      accumulatedSeconds: 0,
      elapsedSeconds: 0,
      isPaused: false,
    });

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => get().updateTick(), 1000) as any;

    if (!appStateSubscription) {
      appStateSubscription = AppState.addEventListener('change', (state) =>
        get().handleAppStateChange(state),
      );
    }
  },

  stopTimer: () => {
    const {
      activeTaskId,
      activeTaskName,
      isPaused,
      sessionStartTime,
      elapsedSeconds,
      accumulatedSeconds,
      initialStartTime,
    } = get();
    if (!activeTaskId) return null;

    let finalSeconds = elapsedSeconds;
    if (!isPaused && sessionStartTime) {
      const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      finalSeconds = accumulatedSeconds + currentElapsed;
    }

    const endTime = Date.now();
    const result = {
      taskId: activeTaskId,
      taskName: activeTaskName,
      seconds: finalSeconds,
      startTime: initialStartTime
        ? Math.floor(initialStartTime / 1000)
        : Math.floor(endTime / 1000) - finalSeconds,
      endTime: Math.floor(endTime / 1000),
    };

    set({
      activeTaskId: null,
      activeTaskName: null,
      activeMode: null,
      targetDuration: 0,
      sessionStartTime: null,
      initialStartTime: null,
      accumulatedSeconds: 0,
      elapsedSeconds: 0,
      isPaused: false,
    });

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    return result;
  },

  togglePause: () => {
    const { activeTaskId, isPaused, sessionStartTime, accumulatedSeconds } = get();
    if (activeTaskId) {
      if (!isPaused && sessionStartTime) {
        // Pausing
        const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        set({
          accumulatedSeconds: accumulatedSeconds + currentElapsed,
          elapsedSeconds: accumulatedSeconds + currentElapsed,
          sessionStartTime: null,
          isPaused: true,
        });
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      } else if (isPaused) {
        // Resuming
        set({
          sessionStartTime: Date.now(),
          isPaused: false,
        });
        if (!timerInterval) {
          timerInterval = setInterval(() => get().updateTick(), 1000) as any;
        }
      }
    }
  },
}));
