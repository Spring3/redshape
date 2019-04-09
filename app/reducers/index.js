import { combineReducers } from 'redux';
import usersReducer from './user.reducer';
import settingsReducer from './settings.reducer';
import issuesReducer from './issues.reducer';
import trackingReducer from './tracking.reducer';
import projectReducer from './project.reducer';
import timeReducer from './time.reducer';

export default combineReducers({
  user: usersReducer,
  settings: settingsReducer,
  issues: issuesReducer,
  projects: projectReducer,
  tracking: trackingReducer,
  time: timeReducer
});
