import type { Context, IAction } from 'overmind';
import { TimeTrackingAction } from '../../../types';

const track: IAction<{ issueId: number }, boolean> = ({ state, actions }: Context, { issueId }) => {
  const [lastRecord] = state.timeTracking.records.slice(-1);
  const date = new Date();

  const isSameIssueThatWasStopped = (lastRecord && lastRecord.action === TimeTrackingAction.STOP && lastRecord.issueId === issueId);
  const isDifferentIssueThatWasStopped = (lastRecord && lastRecord.action === TimeTrackingAction.STOP && lastRecord.issueId !== issueId);

  if (!lastRecord || isSameIssueThatWasStopped || isDifferentIssueThatWasStopped) {
    state.timeTracking.records.push({
      action: TimeTrackingAction.START,
      issueId,
      isoDate: date.toISOString(),
      notes: [],
      id: `${issueId}:${date.getTime()}`
    });
    return true;
  }

  if (lastRecord.issueId === issueId && lastRecord.action === TimeTrackingAction.PAUSE) {
    return actions.timeTracking.unpause();
  }

  if (lastRecord.issueId !== issueId) {
    actions.timeTracking.stop();
    state.timeTracking.records.push({
      action: TimeTrackingAction.START,
      issueId,
      isoDate: date.toISOString(),
      notes: [],
      id: `${issueId}:${date.getTime()}`
    });
    return true;
  }
  return false;
};

const pause: IAction<void, boolean> = ({ state }: Context) => {
  const [lastRecord] = state.timeTracking.records.slice(-1);
  if (lastRecord && [TimeTrackingAction.START, TimeTrackingAction.CONTINUE].includes(lastRecord.action)) {
    const isoDate = new Date().toISOString();
    state.timeTracking.records.push({
      action: TimeTrackingAction.PAUSE,
      issueId: lastRecord.issueId,
      isoDate,
      notes: [],
      id: lastRecord.id
    });
    return true;
  }
  return false;
};

const unpause: IAction<void, boolean> = ({ state }: Context) => {
  const [lastRecord] = state.timeTracking.records.slice(-1);
  if (lastRecord && lastRecord.action === TimeTrackingAction.PAUSE) {
    const isoDate = new Date().toISOString();
    state.timeTracking.records.push({
      action: TimeTrackingAction.CONTINUE,
      issueId: lastRecord.issueId,
      isoDate,
      notes: [],
      id: lastRecord.id
    });
    return true;
  }
  return false;
};

const stop: IAction<void, boolean> = ({ state }: Context) => {
  const [lastRecord] = state.timeTracking.records.slice(-1);
  if (lastRecord && lastRecord.action !== TimeTrackingAction.STOP) {
    const isoDate = new Date().toISOString();
    state.timeTracking.records.push({
      action: TimeTrackingAction.STOP,
      issueId: lastRecord.issueId,
      isoDate,
      notes: [],
      id: lastRecord.id
    });
    return true;
  }
  return false;
};

export {
  track,
  pause,
  unpause,
  stop
};
