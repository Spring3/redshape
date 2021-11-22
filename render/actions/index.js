import trackingActions from './tracking.actions';
import issuesActions from './issues.actions';
import issueActions from './issue.actions';
import timeEntryActions from './timeEntry.actions';
import settingsActions from './settings.actions';

export default {
  issues: issuesActions,
  issue: issueActions,
  tracking: trackingActions,
  timeEntry: timeEntryActions,
  settings: settingsActions
};
