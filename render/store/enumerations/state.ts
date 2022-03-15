import { Activity } from '../../../types';

type EnumerationsState = {
  activities: Activity[];
};

const state: EnumerationsState = {
  activities: []
};

export {
  state
};

export type {
  EnumerationsState
};
