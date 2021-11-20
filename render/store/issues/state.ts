import { derived } from 'overmind';
import { Issue } from '../../../types';

type IssuesState = {
  list: Issue[];
  byId: Record<string, Issue>,
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
