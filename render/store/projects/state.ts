import { derived } from 'overmind';

type ProjectsState = {
  byId: Record<string, any>;
  list: any[];
};

const state: ProjectsState = {
  byId: {},
  list: derived((currentState: ProjectsState) => Object.values(currentState.byId))
};

export {
  state
};

export type {
  ProjectsState
};
