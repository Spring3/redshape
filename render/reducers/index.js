import { combineReducers } from 'redux';
import settingsReducer from './settings.reducer';
import issueReducer from './issue.reducer';
import selectedIssueReducer from './issue.selected.reducer';
import trackingReducer from './tracking.reducer';
import projectReducer from './project.reducer';
import timeEntryReducer from './timeEntry.reducer';

const appReducer = combineReducers({
  settings: settingsReducer,
  issues: combineReducers({
    selected: selectedIssueReducer
  }),
  issue: issueReducer,
  projects: projectReducer,
  tracking: trackingReducer,
  timeEntry: timeEntryReducer
});

export default (state, action) => {
  switch (action.type) {
    default:
      return appReducer(state, action);
  }
};
