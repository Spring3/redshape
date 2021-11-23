import {
  ISSUE_UPDATE,
  ISSUE_RESET,
  ISSUE_UPDATE_VALIDATION_FAILED,
  ISSUE_UPDATE_VALIDATION_PASSED
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
    case ISSUE_UPDATE_VALIDATION_FAILED: {
      return { ...state, error: action.data };
    }
    case ISSUE_UPDATE_VALIDATION_PASSED: {
      return { ...state, error: undefined };
    }
    default:
      return state;
  }
};
