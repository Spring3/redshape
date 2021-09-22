import type { IssueHeader } from '../../../types';

type State = {
  showClosedIssues: boolean;
  issueHeaders: IssueHeader[]
}

const state: State = {
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
  ]
};

export {
  state,
};

export type {
  State
};
