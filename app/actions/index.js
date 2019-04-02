import userActions from './user.actions';
import trackingActions from './tracking.actions';
import issuesActions from './issues.actions';
import projectActions from './project.actions';

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
const updateSettings = data => ({ type: UPDATE_SETTINGS, data });

export default {
  user: userActions,
  issues: issuesActions,
  tracking: trackingActions,
  projects: projectActions,
  settings: {
    update: updateSettings
  }
};
