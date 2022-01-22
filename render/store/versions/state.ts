import { Version } from '../../../types';

type VersionsState = {
  byProjectId: Record<number, Record<number, Version>>
};

const state: VersionsState = {
  byProjectId: {}
};

export {
  state
};

export type {
  VersionsState
};
