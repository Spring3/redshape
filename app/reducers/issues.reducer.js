import _ from 'lodash';
import {
  ISSUES_GET_ALL
} from '../actions/issues.actions';

export const initialState = {
  data: [],
  fetchedOffset: 0,
  isFetching: false,
  error: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ISSUES_GET_ALL: {
      switch (action.status) {
        case 'START': {
          return { ...state, isFetching: true };
        }
        case 'OK': {
          return { ...state, isFetching: false, data: _.get(action.data, 'issues', []), error: undefined };
        }
        case 'NOK': {
          return { ...state, isFetching: false, error: action.data };
        }
        default:
          return state;
      }
    }
    default:
      return state;
  }
};
