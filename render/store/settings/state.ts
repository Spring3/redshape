import type { IssueHeader } from '../../../types';

type SettingsState = {
  showClosedIssues: boolean;
  issueHeaders: IssueHeader[];
  endpoint?: string;
}

const defaultSettingsState = {
  showClosedIssues: false,
  issueHeaders: [
    { label: 'Id', isFixed: true, value: 'id' },
    { label: 'Subject', isFixed: true, value: 'subject' },
    { label: 'Project', isFixed: false, value: 'project.name' },
    { label: 'Tracker', isFixed: false, value: 'tracker.name' },
    { label: 'Status', isFixed: false, value: 'status.name' },
    { label: 'Priority', isFixed: false, value: 'priority.name' },
    { label: 'Estimation', isFixed: false, value: 'estimated_hours' },
    { label: 'Due Date', isFixed: false, value: 'due_date' }
  ],
  endpoint: undefined
};

const state: SettingsState = {
  ...defaultSettingsState
};

export {
  state,
  defaultSettingsState
};

export type {
  SettingsState
};
