import { combineReducers } from 'redux';
import usersReducer from './user.reducer';
import settingsReducer from './settings.reducer';

export default combineReducers({
  user: usersReducer,
  settings: settingsReducer
});
