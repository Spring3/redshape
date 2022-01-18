import { combineReducers } from 'redux';
import settingsReducer from './settings.reducer';
import issueReducer from './issue.reducer';
import selectedIssueReducer from './issue.selected.reducer';

const appReducer = combineReducers({
  settings: settingsReducer,
  issues: combineReducers({
    selected: selectedIssueReducer
  }),
  issue: issueReducer
});

export default (state, action) => {
  switch (action.type) {
    default:
      return appReducer(state, action);
  }
};
