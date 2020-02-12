import { combineReducers } from 'redux';
import usersReducer from './user.reducer';
import settingsReducer from './settings.reducer';
import allIssuesReducer from './issues.reducer';
import issueReducer from './issue.reducer';
import selectedIssueReducer from './issue.selected.reducer';
import trackingReducer from './tracking.reducer';
import projectReducer from './project.reducer';
import fieldReducer from './field.reducer';
import timeEntryReducer from './timeEntry.reducer';
import logReducer from './log.reducer';

import { USER_LOGOUT } from '../actions/user.actions';

const appReducer = combineReducers({
  user: usersReducer,
  settings: settingsReducer,
  issues: combineReducers({
    all: allIssuesReducer,
    selected: selectedIssueReducer
  }),
  issue: issueReducer,
  projects: projectReducer,
  fields: fieldReducer,
  tracking: trackingReducer,
  timeEntry: timeEntryReducer,
  log: logReducer
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
