import { IssueStatus } from '../../../types';

type IssueStatusesState = {
  byId: Record<number, IssueStatus>
};

const state: IssueStatusesState = {
  byId: {}
};

export {
  state
};

export type {
  IssueStatusesState
};
