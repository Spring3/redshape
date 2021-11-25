import { TimeTrackingStatus } from '../../../types';

type TimeTrackingState = {
  status: TimeTrackingStatus
  ticketId?: number;
};

const state: TimeTrackingState = {
  status: TimeTrackingStatus.IDLE
};

export {
  state
};

export type {
  TimeTrackingState
};
