import { TimeTrackingStatus } from '../../../types';

type TimeTrackingState = {
  status: TimeTrackingStatus
  ticketId?: number;
  timeMs: number;
};

const state: TimeTrackingState = {
  status: TimeTrackingStatus.IDLE,
  timeMs: 0
};

export {
  state
};

export type {
  TimeTrackingState
};
