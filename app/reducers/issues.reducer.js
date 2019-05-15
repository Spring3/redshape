import _get from 'lodash/get';
import {
  ISSUES_GET_ALL
} from '../actions/issues.actions';

export const initialState = {
  data: [],
  page: 0,
  limit: 20,
  totalCount: 0,
  isFetching: false,
  error: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ISSUES_GET_ALL: {
      switch (action.status) {
        case 'START': {
          return {
            ...state,
            isFetching: true,
            page: {}.hasOwnProperty.call(action.info, 'page') ? action.info.page : state.page
          };
        }
        case 'OK': {
          const nextState = {
            ...state,
            isFetching: false,
            data: action.info.page === 0
              ? _get(action.data, 'issues', [])
              : [...state.data, ..._get(action.data, 'issues', [])],
            totalCount: action.data.total_count,
            error: undefined
          };
          return nextState;
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
