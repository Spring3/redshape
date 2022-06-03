import { combineReducers } from 'redux';
import settingsReducer from './settings.reducer';
import issueReducer from './issue.reducer';

const appReducer = combineReducers({
  settings: settingsReducer,
  issue: issueReducer
});

export default (state, action) => {
  switch (action.type) {
    default:
      return appReducer(state, action);
  }
};
