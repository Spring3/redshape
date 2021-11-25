import type { Context, IAction } from 'overmind';
import { TimeTrackingAction } from '../../../types';

const track: IAction<{ ticketId: number }, void> = ({ state, actions }: Context, { ticketId }) => {
  const [lastRecord] = state.timeTracking.records.slice(-1);
  const isoDate = new Date().toISOString();

  const isSameTicketThatWasStopped = (lastRecord && lastRecord.action === TimeTrackingAction.STOP && lastRecord.ticketId === ticketId);
  const isDifferentTicketThatWasStopped = (lastRecord && lastRecord.action === TimeTrackingAction.STOP && lastRecord.ticketId !== ticketId);

  if (!lastRecord || isSameTicketThatWasStopped || isDifferentTicketThatWasStopped) {
    state.timeTracking.records.push({
      action: TimeTrackingAction.START,
      ticketId,
      isoDate,
      notes: []
    });
  } else if (lastRecord.ticketId === ticketId && lastRecord.action === TimeTrackingAction.PAUSE) {
    actions.timeTracking.unpause();
  } else if (lastRecord.ticketId !== ticketId) {
    actions.timeTracking.stop();
    state.timeTracking.records.push({
      action: TimeTrackingAction.START,
      ticketId,
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
      ticketId: lastRecord.ticketId,
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
      ticketId: lastRecord.ticketId,
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
      ticketId: lastRecord.ticketId,
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
