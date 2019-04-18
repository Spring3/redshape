import { combineReducers } from 'redux';
import usersReducer from './user.reducer';
import settingsReducer from './settings.reducer';
import issuesReducer from './issues.reducer';
import trackingReducer from './tracking.reducer';
import projectReducer from './project.reducer';
import timeReducer from './time.reducer';

import { USER_LOGOUT } from '../actions/user.actions';

const appReducer = combineReducers({
  user: usersReducer,
  settings: settingsReducer,
  issues: issuesReducer,
  projects: projectReducer,
  tracking: trackingReducer,
  time: timeReducer
});

export default (state, action) => {
  switch (action.type) {
    case USER_LOGOUT: {
      return appReducer(undefined, action);
    }
    default:
      return appReducer(state, action);
  }
};
