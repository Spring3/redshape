import userActions from './user.actions';
import timeActions from './time.actions';
import issuesActions from './issues.actions';

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
const updateSettings = data => ({ type: UPDATE_SETTINGS, data });

export default {
  user: userActions,
  issues: issuesActions,
  time: timeActions,
  settings: {
    update: updateSettings
  }
};
