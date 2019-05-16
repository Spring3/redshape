import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import _get from 'lodash/get';

import storage from '../modules/storage';
import reducers from './reducers/index.js';

const initialState = storage.store;

const user = _get(initialState, 'user', {});
const { id, redmineEndpoint } = user;
const userSettings = _get(initialState, `settings.${redmineEndpoint}.${id}`);

export default createStore(reducers, {
  user,
  settings: userSettings,
  projects: initialState.projects,
  tracking: initialState.time_tracking
},
applyMiddleware(thunk));
