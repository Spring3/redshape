import type { Context, IAction } from 'overmind';
import { TimeTrackingAction } from '../../../types';

const track: IAction<{ issueId: number }, void> = ({ state, actions }: Context, { issueId }) => {
  const [lastRecord] = state.timeTracking.records.slice(-1);
  const isoDate = new Date().toISOString();

  const isSameIssueThatWasStopped = (lastRecord && lastRecord.action === TimeTrackingAction.STOP && lastRecord.issueId === issueId);
  const isDifferentIssueThatWasStopped = (lastRecord && lastRecord.action === TimeTrackingAction.STOP && lastRecord.issueId !== issueId);

  if (!lastRecord || isSameIssueThatWasStopped || isDifferentIssueThatWasStopped) {
    state.timeTracking.records.push({
      action: TimeTrackingAction.START,
      issueId,
      isoDate,
      notes: []
    });
  } else if (lastRecord.issueId === issueId && lastRecord.action === TimeTrackingAction.PAUSE) {
    actions.timeTracking.unpause();
  } else if (lastRecord.issueId !== issueId) {
    actions.timeTracking.stop();
    state.timeTracking.records.push({
      action: TimeTrackingAction.START,
      issueId,
      isoDate,
      notes: []
    });
  }
};

const pause: IAction<void, void> = ({ state }: Context) => {
  const [lastRecord] = state.timeTracking.records.slice(-1);
  if (lastRecord && lastRecord.action === TimeTrackingAction.START) {
    const isoDate = new Date().toISOString();
    state.timeTracking.records.push({
      action: TimeTrackingAction.PAUSE,
      issueId: lastRecord.issueId,
      isoDate,
      notes: []
    });
  }
};

const unpause: IAction<void, void> = ({ state }: Context) => {
  const [lastRecord] = state.timeTracking.records.slice(-1);
  if (lastRecord && lastRecord.action === TimeTrackingAction.PAUSE) {
    const isoDate = new Date().toISOString();
    state.timeTracking.records.push({
      action: TimeTrackingAction.CONTINUE,
      issueId: lastRecord.issueId,
      isoDate,
      notes: []
    });
  }
};

const stop: IAction<void, void> = ({ state }: Context) => {
  const [lastRecord] = state.timeTracking.records.slice(-1);
  if (lastRecord && lastRecord.action !== TimeTrackingAction.STOP) {
    const isoDate = new Date().toISOString();
    state.timeTracking.records.push({
      action: TimeTrackingAction.STOP,
      issueId: lastRecord.issueId,
      isoDate,
      notes: []
    });
  }
};

export {
  track,
  pause,
  unpause,
  stop
};
