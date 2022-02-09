import { derived } from 'overmind';
import { TimeEntry, Activity } from '../../../types';

type TimeEntriesState = {
  mapByIssueId: Record<string, Record<number, TimeEntry>>;
  listByIssueId: Record<string, TimeEntry[]>;
};

const state: TimeEntriesState = {
  listByIssueId: derived(
    (currentState: TimeEntriesState) => Object.fromEntries(Object.entries(currentState.mapByIssueId).map(([issueId, timeEntryMap]) => ([issueId, Object.values(timeEntryMap)])))
  ),
  mapByIssueId: {},
};

export {
  state
};

export type {
  TimeEntriesState
};
