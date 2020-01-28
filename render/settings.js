export const availableOptions = {
  // Used in OptionsBlock.jsx and settings.reducer.js
  // uiStyle, idleBehavior, progressSlider, timerCheckpoint
  uiStyle: [
    { value: 'default', label: 'Default' },
    { value: 'colors', label: 'Default with colors' },
    { value: 'enhanced', label: 'Enhanced' },
  ],
  idleBehavior: [
    { value: 'none', label: 'Do nothing' },
    { value: '1m', label: 'Pause if idle for 1 minute' },
    { value: '2m', label: 'Pause if idle for 2 minutes' },
    { value: '5m', label: 'Pause if idle for 5 minutes' },
    { value: '10m', label: 'Pause if idle for 10 minutes' },
    { value: '15m', label: 'Pause if idle for 15 minutes' },
    { value: '20m', label: 'Pause if idle for 20 minutes' },
    { value: '30m', label: 'Pause if idle for 30 minutes' },
    { value: '45m', label: 'Pause if idle for 45 minutes' },
    { value: '1h', label: 'Pause if idle for 1 hour' },
  ],
  progressSlider: [
    { value: '1%', label: 'Slider with 1% steps' },
    { value: '2%', label: 'Slider with 2% steps' },
    { value: '5%', label: 'Slider with 5% steps' },
    { value: '10%', label: 'Slider with 10% steps' },
  ],
  timerCheckpoint: [
    { value: 'none', label: 'Do not save state periodically' },
    { value: '1m', label: 'Save state every minute' },
    { value: '2m', label: 'Save state every 2 minutes' },
    { value: '3m', label: 'Save state every 3 minutes' },
    { value: '5m', label: 'Save state every 5 minutes' },
    { value: '10m', label: 'Save state every 10 minutes' },
    { value: '15m', label: 'Save state every 15 minutes' },
    { value: '30m', label: 'Save state every 30 minutes' },
  ],
  // Used in ColumnHeadersSelect.jsx and settings.reducer.js
  // issueHeaders
  issueHeaders: [
    {
      label: 'Id', isFixed: true, value: 'id', format: 'id'
    },
    { label: 'Project', value: 'project.name' },
    { label: 'Tracker', value: 'tracker.name', format: 'tracker' },
    { label: 'Status', value: 'status.name', format: 'status' },
    { label: 'Subject', isFixed: true, value: 'subject' },
    { label: 'Priority', value: 'priority.name', format: 'priority' },
    { label: 'Estimation', value: 'estimated_hours', format: 'hours' },
    { label: 'Total Estimation', value: 'total_estimated_hours', format: 'hours' },
    { label: 'Spent', value: 'spent_hours', format: 'hours' },
    { label: 'Total Spent', value: 'total_spent_hours', format: 'hours' },
    { label: 'Progress', value: 'done_ratio', format: 'progress' },
    { label: 'Tags', value: 'tags', format: 'tags' },
    { label: 'Due Date', value: 'due_date', format: 'date' },
    { label: 'Attachments', value: 'attachments', format: 'count' },
    { label: 'Assigned', value: 'assigned_to.name' },
    { label: 'Author', value: 'author.name' },
    { label: 'Updated', value: 'updated_on', format: 'date' },
    { label: 'Created', value: 'created_on', format: 'date' },
  ]
};
