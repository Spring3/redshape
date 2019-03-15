import _ from 'lodash';
import { USER_LOGIN, USER_LOGOUT } from '../actions/user.actions';
import storage from '../../modules/storage';

export const initialState = {
  isFetching: false,
  loginError: undefined,
  id: undefined,
  firstname: undefined,
  lastname: undefined,
  redmineEndpoint: undefined,
  api_key: undefined
};

const handleUserLogin = (state, action) => {
  switch (action.status) {
    case 'START': {
      return { ...initialState, isFetching: true };
    }
    case 'OK': {
      const userData = _.get(action.data, 'user', {});
      const payload = _.pick(userData, 'id', 'firstname', 'lastname', 'redmineEndpoint', 'api_key');
      storage.set('user', payload);
      return { ...state, ...payload, isFetching: false, loginError: undefined };
    }
    case 'NOK': {
      return { ...state, loginError: action.data, isFetching: false };
    }
    default:
      return state;
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGIN: {
      return handleUserLogin(state, action);
    }
    case USER_LOGOUT: {
      // we keep settings cause they are general app settings
      const settings = storage.get('settings');
      storage.clear();
      if (settings) {
        storage.set('settings', settings);
      }
      return { ...initialState };
    }
    default:
      return state;
  }
};
