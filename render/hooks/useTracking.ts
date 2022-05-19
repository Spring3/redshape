import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TimeTrackingAction } from '../../types';
import { useOvermindActions, useOvermindState } from '../store';

const getLastRecord = <T>(array: T[]): T => array[array.length - 1];

export const useTracking = () => {
  const intervalRef = useRef<any>();
  const [issueId, setIssueId] = useState<number>();
  const [trackedTimeMs, setTrackedTimeMs] = useState(0);
  const actions = useOvermindActions();
  const state = useOvermindState();

  const lastRecord = getLastRecord(state.timeTracking.records);

  const tick = () => {
    setTrackedTimeMs(trackedSoFar => trackedSoFar + 1000);
  };

  useEffect(() => {
    actions.timeTracking.unpause();

    return () => {
      actions.timeTracking.pause();
    };
  }, []);

  const track = useCallback((id: number) => {
    const success = actions.timeTracking.track({ issueId: id });
    if (success) {
      setIssueId(id);
      setTrackedTimeMs(0);
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [actions.timeTracking.track]);

  const stop = useCallback(() => {
    const success = actions.timeTracking.stop();
    if (success) {
      clearInterval(intervalRef.current);
    }
  }, [actions.timeTracking.stop]);

  const pause = useCallback(() => {
    const success = actions.timeTracking.pause();
    if (success) {
      clearInterval(intervalRef.current);
    }
  }, [actions.timeTracking.pause]);

  const unpause = useCallback(() => {
    const success = actions.timeTracking.unpause();
    if (success) {
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [actions.timeTracking.unpause]);

  return useMemo(() => {
    if (!lastRecord) {
      return {
        isTracking: false,
        isPaused: false,
        isStopped: true,
        issue: null,
        trackedTimeMs,
        track,
        stop,
        pause,
        unpause
      };
    }

    return {
      isTracking: lastRecord.issueId === issueId && [TimeTrackingAction.START, TimeTrackingAction.CONTINUE].includes(lastRecord.action),
      isPaused: lastRecord.issueId === issueId && lastRecord.action === TimeTrackingAction.PAUSE,
      isStopped: lastRecord.issueId === issueId && lastRecord.action === TimeTrackingAction.STOP,
      issue: issueId ? state.issues.byId[issueId] : null,
      trackedTimeMs,
      track,
      stop,
      pause,
      unpause
    };
  }, [issueId, lastRecord, actions.timeTracking, trackedTimeMs]);
};
