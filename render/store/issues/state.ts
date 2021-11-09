import { derived } from 'overmind';

type IssuesState = {
  list: any[];
  byId: Record<string, any>,
  status: 'idle' | 'fetching';
}

const state: IssuesState = {
  list: derived((issuesState: IssuesState) => Object.values(issuesState.byId)),
  byId: {},
  status: 'idle',
};

export {
  state
};

export type {
  IssuesState
};
