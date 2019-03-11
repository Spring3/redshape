import _ from 'lodash';
import { LOGIN, LOGOUT } from '../actions';
import storage from '../../modules/storage';

const initialState = {
  id: undefined,
  firstname: undefined,
  lastname: undefined,
  redmineDomain: undefined,
  api_key: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN: {
      const payload = _.pick(
        _.get(action, 'data', {}),
        'id', 'firstname', 'lastname', 'redmineDomain', 'api_key'
      );
      storage.set('user', payload);
      return { ...payload };
    }
    case LOGOUT: {
      // we keep settings cause they are general app settings
      const settings = storage.get('settings');
      storage.clear();
      if (settings) {
        storage.set('settings', settings);
      }
      return {};
    }
    default:
      return state;
  }
};
