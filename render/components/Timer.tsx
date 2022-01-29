import React, {
  useState, useEffect, useRef, useCallback
} from 'react';
// eslint-disable-next-line
import moment from 'moment';
import styled from 'styled-components';
import PlayIcon from 'mdi-react/PlayIcon';
import PauseIcon from 'mdi-react/PauseIcon';
import StopIcon from 'mdi-react/StopIcon';

import { GhostButton } from './GhostButton';
import { animationSlideUp } from '../animations';
import { Link } from './Link';
import { useOvermindActions, useOvermindState } from '../store';
import { Issue, TimeTrackingAction } from '../../types';

const ActiveTimer = styled.div`
  animation: ${animationSlideUp} .7s ease-in;
  max-width: 100%;
  box-sizing: border-box;
  padding: 20px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background: ${(props) => props.theme.bg};
  display: ${(props) => (props.isEnabled ? 'flex' : 'none')};
  align-items: center;
  box-shadow: 0px -2px 20px ${(props) => props.theme.bgDark};
  border-top: 2px solid ${(props) => props.theme.bgDark};
  
  div.panel {
    flex-grow: 0;
    min-width: 520px;
    display: flex;
    align-items: center;
    max-width: ${(props) => (props.advancedTimerControls ? '900px' : '1800px')};
  }
  
  div.buttons {
    margin: 0 20px;
    display: flex;
  }
  
  div.time {
    margin: 0 20px;
    font-size: 16px;
    font-weight: bold;
  }

  div.buttons {
    a {
      padding: 10px 0px;

      &:hover {
        background: ${(props) => props.theme.bgDark};
      }
    }

    a:first-child {
      margin-right: 20px;
    }
  }
  
  div.buttons.buttons-advanced {
    a {
      margin-right: 5px;
    }
    a:last-child {
      margin-right: initial;
    }
  }
  
  div.issueName {
    padding: 0 20px;
    max-width: 500px;
  }

  div.time {
    color: ${(props) => props.theme.main};
  }
  
  input[name="comment"] {
    flex-grow: 2;
    margin-left: 20px;
    width: initial;
    border: none;
    border-radius: 0;
    border-bottom: 1px ${(props) => props.theme.bgDark} solid;
    color: #A4A4A4;
    &:focus {
      border: none;
      border-radius: 0;
      border-bottom: 1px ${(props) => props.theme.main} solid;
      box-shadow: none;
    }
  }
  
`;

const StyledButton = styled(GhostButton)`
  padding: 0px;
`;

const MaskedLink = styled(Link)`
  color: inherit;
  padding: 0;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
`;

type TimerEventHook = (args: { issue: Issue, recordedTime: number }) => void;

type TimerProps = {
  startFrom?: number;
  autoStart?: boolean;
  onStop?: TimerEventHook;
  onStart?: TimerEventHook;
  onPause?: TimerEventHook;
  onContinue?: TimerEventHook;
}

const Timer = ({ startFrom = 0, autoStart = false, onStop, onStart, onPause, onContinue }: TimerProps) => {
  const [timeMs, setTimeMs] = useState(startFrom);
  const interval = useRef<ReturnType<typeof setInterval>>();
  const state = useOvermindState();
  const actions = useOvermindActions();

  const [lastTimeRecord] = state.timeTracking.records.slice(-1);
  const issueId = lastTimeRecord?.issueId;
  const targetIssue = state.issues.byId[issueId];

  const isCounting = [TimeTrackingAction.CONTINUE, TimeTrackingAction.START].includes(lastTimeRecord?.action);
  const isPaused = lastTimeRecord?.action === TimeTrackingAction.PAUSE;
  const isStopped = lastTimeRecord?.action === TimeTrackingAction.STOP;

  const tick = useCallback(() => {
    setTimeMs((trackedTimeMs) => trackedTimeMs + 1000);
  }, []);

  const start = useCallback(() => {
    if (isPaused || isStopped) {
      actions.timeTracking.track({ issueId });
      if (!interval.current) {
        interval.current = setInterval(tick, 1000);
      }
      if (onStart) {
        onStart({ issue: targetIssue, recordedTime: timeMs });
      }
    }
  }, [actions.timeTracking.track, issueId, tick, targetIssue, onStart, timeMs]);

  const stop = useCallback(() => {
    if (isCounting) {
      actions.timeTracking.stop();
      if (interval.current) {
        clearInterval(interval.current);
      }
      if (onStop) {
        onStop({ issue: targetIssue, recordedTime: timeMs });
      }
    }
  }, [actions.timeTracking.stop, onStop, targetIssue, timeMs]);

  const pause = useCallback(() => {
    if (isCounting) {
      actions.timeTracking.pause();
      if (interval.current) {
        clearInterval(interval.current);
      }
      if (onPause) {
        onPause({ issue: targetIssue, recordedTime: timeMs });
      }
    }
  }, [actions.timeTracking.pause, onPause, targetIssue, timeMs]);

  const unpaunse = useCallback(() => {
    if (isPaused) {
      actions.timeTracking.unpause();
      if (!interval.current) {
        interval.current = setInterval(tick, 1000);
      }
      if (onContinue) {
        onContinue({ issue: targetIssue, recordedTime: timeMs });
      }
    }
  }, [actions.timeTracking.unpause, tick, onContinue, targetIssue, timeMs]);

  useEffect(() => {
    if (isCounting) {
      setTimeMs(startFrom);
      if (autoStart) {
        start();
      }
    }
  }, [startFrom, autoStart, start]);

  const timeString = moment.utc(timeMs).format('HH:mm:ss');
  return (
    <>
      <ActiveTimer isEnabled={lastTimeRecord && !isStopped}>
        <div className="panel">
          <div className="buttons">
            <StyledButton
              id="stop-timer"
              onClick={stop}
            >
              <StopIcon size={35} />
            </StyledButton>
            { isPaused
              ? (
                <StyledButton
                  id="continue-timer"
                  onClick={unpaunse}
                >
                  <PlayIcon size={35} />
                </StyledButton>
              )
              : (
                <StyledButton
                  id="pause-timer"
                  onClick={pause}
                >
                  <PauseIcon size={35} />
                </StyledButton>
              )}
          </div>
          <div className="issueName">
            { !isStopped
              ? (
                <MaskedLink
                  href="#"
                >
                  {targetIssue?.subject}
                </MaskedLink>
              )
              : null}
          </div>
          <div className="time">
            <span>{timeString}</span>
          </div>
        </div>
      </ActiveTimer>
    </>
  );
};

export {
  Timer
};
