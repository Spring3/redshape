import type { TimeTrackingRecord } from '../../../types';

type TimeTrackingState = {
  records: TimeTrackingRecord[];
};

const state: TimeTrackingState = {
  records: []
};

export {
  state,
};

export type {
  TimeTrackingState,
};
