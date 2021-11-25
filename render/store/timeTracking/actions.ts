import type { Context, IAction } from 'overmind';
import { TimeTrackingStatus } from '../../../types';

const track: IAction<{ ticketId: number }, void> = ({ state }: Context, { ticketId }) => {
  state.timeTracking.status = TimeTrackingStatus.TRACKING;
  state.timeTracking.ticketId = ticketId;
};

const pause: IAction<void, void> = ({ state }: Context) => {
  state.timeTracking.status = TimeTrackingStatus.PAUSED;
};

const unpause: IAction<void, void> = ({ state }: Context) => {
  state.timeTracking.status = TimeTrackingStatus.TRACKING;
};

const stop: IAction<void, void> = ({ state }: Context) => {
  state.timeTracking.status = TimeTrackingStatus.IDLE;
};

export {
  track,
  pause,
  unpause,
  stop
};
