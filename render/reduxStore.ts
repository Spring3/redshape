import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import _get from 'lodash/get';

import reducers from './reducers/index';

// const user = _get(initialState, 'user', {});
// const { id, redmineEndpoint } = user;
// const userSettings = _get(initialState, `settings.${redmineEndpoint}.${id}`);

// export default createStore(reducers, {
//   user,
//   settings: userSettings,
//   projects: initialState.projects,
//   tracking: initialState.time_tracking
// },

export default createStore(reducers, applyMiddleware(thunk));
