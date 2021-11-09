import { derived } from 'overmind';

type IssuesState = {
  list: any[];
  byId: Record<string, any>,
}

const state: IssuesState = {
  list: derived((issuesState: IssuesState) => Object.values(issuesState.byId)),
  byId: {},
};

export {
  state
};

export type {
  IssuesState
};
