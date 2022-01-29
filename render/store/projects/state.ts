import { derived } from 'overmind';
import { Project } from '../../../types';

type ProjectsState = {
  byId: Record<string, Project>;
  list: Project[];
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
