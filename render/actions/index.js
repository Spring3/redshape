import userActions from './user.actions';
import trackingActions from './tracking.actions';
import issuesActions from './issues.actions';
import issueActions from './issue.actions';
import projectActions from './project.actions';
import timeEntryActions from './timeEntry.actions';
import settingsActions from './settings.actions';

export default {
  user: userActions,
  issues: issuesActions,
  issue: issueActions,
  tracking: trackingActions,
  projects: projectActions,
  timeEntry: timeEntryActions,
  settings: settingsActions
};
