import React, { createContext, ReactNode, useContext } from 'react';
import { useTracking } from '../hooks/useTracking';

export const TimerContext = createContext<ReturnType<typeof useTracking>>({
  isTracking: false,
  isPaused: false,
  isStopped: true,
  issue: null,
  trackedTimeMs: 0,
  track: () => { /* noop */ },
  stop: () => { /* noop */ },
  pause: () => { /* noop */ },
  unpause: () => { /* noop */ },
});

export const useTimeTracking = () => useContext(TimerContext);

export const TimerContextProvider = ({ children }: { children: ReactNode }) => {
  const tracking = useTracking();

  return (
    <TimerContext.Provider value={tracking}>
      {children}
    </TimerContext.Provider>
  );
};
