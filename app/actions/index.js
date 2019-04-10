import userActions from './user.actions';
import trackingActions from './tracking.actions';
import issuesActions from './issues.actions';
import projectActions from './project.actions';
import timeActions from './time.actions';
import settingsActions from './settings.actions';

export default {
  user: userActions,
  issues: issuesActions,
  tracking: trackingActions,
  projects: projectActions,
  time: timeActions,
  settings: settingsActions
};
