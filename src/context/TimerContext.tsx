import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState } from 'react-native';

interface TimerContextData {
  activeTaskId: number | null;
  activeTaskName: string | null;
  elapsedSeconds: number;
  isPaused: boolean;
  startTimer: (taskId: number, taskName: string) => void;
  stopTimer: () => { taskId: number; seconds: number; startTime: number; endTime: number } | null;
  togglePause: () => void;
}

const TimerContext = createContext<TimerContextData | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeTaskName, setActiveTaskName] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // New state variables for robust background counting
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [initialStartTime, setInitialStartTime] = useState<number | null>(null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTaskId && !isPaused && sessionStartTime) {
      interval = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setElapsedSeconds(accumulatedSeconds + currentElapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTaskId, isPaused, sessionStartTime, accumulatedSeconds]);

  // AppState listener for immediate updates on foregrounding
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && activeTaskId && !isPaused && sessionStartTime) {
         // force a refresh of the elapsed seconds
         const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
         setElapsedSeconds(accumulatedSeconds + currentElapsed);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [activeTaskId, isPaused, sessionStartTime, accumulatedSeconds]);

  const startTimer = (taskId: number, taskName: string) => {
    if (activeTaskId === taskId) {
      if (isPaused) {
        // Resuming
        setSessionStartTime(Date.now());
        setIsPaused(false);
      }
      return; // Already running or just resumed
    }
    
    setActiveTaskId(taskId);
    setActiveTaskName(taskName);
    const now = Date.now();
    setSessionStartTime(now);
    setInitialStartTime(now);
    setAccumulatedSeconds(0);
    setElapsedSeconds(0);
    setIsPaused(false);
  };

  const stopTimer = () => {
    if (!activeTaskId) return null;
    
    let finalSeconds = elapsedSeconds;
    if (!isPaused && sessionStartTime) {
      const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      finalSeconds = accumulatedSeconds + currentElapsed;
    }
    
    const endTime = Date.now();
    const result = {
      taskId: activeTaskId,
      seconds: finalSeconds,
      startTime: initialStartTime ? Math.floor(initialStartTime / 1000) : Math.floor(endTime / 1000) - finalSeconds,
      endTime: Math.floor(endTime / 1000)
    };
    
    setActiveTaskId(null);
    setActiveTaskName(null);
    setSessionStartTime(null);
    setInitialStartTime(null);
    setAccumulatedSeconds(0);
    setElapsedSeconds(0);
    setIsPaused(false);
    
    return result;
  };

  const togglePause = () => {
    if (activeTaskId) {
      if (!isPaused && sessionStartTime) {
        // Pausing
        const currentElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setAccumulatedSeconds(prev => prev + currentElapsed);
        setElapsedSeconds(accumulatedSeconds + currentElapsed);
        setSessionStartTime(null);
        setIsPaused(true);
      } else if (isPaused) {
        // Resuming
        setSessionStartTime(Date.now());
        setIsPaused(false);
      }
    }
  };

  return (
    <TimerContext.Provider 
      value={{ 
        activeTaskId, 
        activeTaskName,
        elapsedSeconds, 
        isPaused,
        startTimer, 
        stopTimer,
        togglePause
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
