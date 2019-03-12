import _ from 'lodash';
import { combineReducers } from 'redux';
import { ISSUES_GET_ALL } from '../actions/issues.actions';

const initialStateAll = {
  data: [],
  fetchedOffset: 0,
  isFetching: false,
  error: undefined
};

const issuesGetAll = (state = initialStateAll, action) => {
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

export default combineReducers({
  all: issuesGetAll
});
