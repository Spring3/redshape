import {
  ISSUE_UPDATE,
} from '../actions/issue.actions';

export const initialState = {
  isFetching: false,
  error: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ISSUE_UPDATE: {
      if (action.status === 'START') {
        return { ...state, isFetching: true };
      }
      if (action.status === 'OK') {
        return { ...state, isFetching: false, error: undefined };
      }
      if (action.status === 'NOK') {
        return { ...state, isFetching: false, error: action.data };
      }
      return state;
    }
    default:
      return state;
  }
};
