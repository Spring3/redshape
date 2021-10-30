import _ from 'lodash';
import { USER_LOGOUT } from '../actions/user.actions';

export const initialState = {
};

export default (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGOUT: {
      return { ...initialState };
    }
    default:
      return state;
  }
};
