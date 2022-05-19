import PauseIcon from 'mdi-react/PauseIcon';
import PlayIcon from 'mdi-react/PlayIcon';
import StopIcon from 'mdi-react/StopIcon';
import React, { useMemo } from 'react';
import { TimeEntry } from '../../types';
import { useTimeTracking } from '../contexts/TimerContext';
import { hoursToTimeSpent, toTimerFormat } from '../helpers/utils';
import { Button } from './Button';
import { ButtonGroup } from './ButtonGroup';

type TimeTrackerButtonProps = {
  issueId: number;
  timeEntries: TimeEntry[];
  userId: number;
};

export const TimeTrackerButton = ({ issueId, timeEntries, userId }: TimeTrackerButtonProps) => {
  const timeTrackingContext = useTimeTracking();

  const hoursSpent = useMemo(
    () => timeEntries
      .filter(timeEntry => timeEntry.user.id === userId)
      .reduce((totalHours, timeEntry) => totalHours + timeEntry.hours, 0),
    [timeEntries, userId]
  );

  if (timeTrackingContext.issue && issueId !== timeTrackingContext.issue.id) {
    return (
      <ButtonGroup text={hoursToTimeSpent(hoursSpent) || '00:00:00'}>
        <Button
          onClick={() => {
            timeTrackingContext.track(issueId);
          }}
        >
          <PlayIcon />
        </Button>
      </ButtonGroup>
    );
  }

  return (
    <ButtonGroup text={toTimerFormat(timeTrackingContext.trackedTimeMs)}>
      {(timeTrackingContext.isPaused || timeTrackingContext.isStopped) && (
        <Button
          onClick={() => {
            if (timeTrackingContext.isStopped) {
              timeTrackingContext.track(issueId);
            } else if (timeTrackingContext.isTracking) {
              timeTrackingContext.stop();
            } else if (timeTrackingContext.isPaused) {
              timeTrackingContext.unpause();
            }
          }}
        >
          <PlayIcon />
        </Button>
      )}
      {timeTrackingContext.isTracking && (
        <Button
          onClick={() => {
            timeTrackingContext.pause();
          }}
        >
          <PauseIcon />
        </Button>
      )}
      {!timeTrackingContext.isStopped && (
        <Button onClick={() => timeTrackingContext.stop()}>
          <StopIcon />
        </Button>
      )}
    </ButtonGroup>
  );
};
