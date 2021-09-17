const state = {
  showClosedIssues: false,
  issueHeaders: [
    { label: 'Id', isFixed: true, value: 'id' },
    { label: 'Subject', isFixed: true, value: 'subject' },
    { label: 'Project', value: 'project.name' },
    { label: 'Tracker', value: 'tracker.name' },
    { label: 'Status', value: 'status.name' },
    { label: 'Priority', value: 'priority.name' },
    { label: 'Estimation', value: 'estimated_hours' },
    { label: 'Due Date', value: 'due_date' }
  ]
};

export {
  state
};
