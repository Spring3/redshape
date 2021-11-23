import {
  TIME_ENTRY_PUBLISH,
  TIME_ENTRY_UPDATE,
  TIME_ENTRY_DELETE,
  TIME_ENTRY_PUBLISH_VALIDATION_FAILED,
  TIME_ENTRY_UPDATE_VALIDATION_FAILED,
  TIME_ENTRY_PUBLISH_VALIDATION_PASSED,
  TIME_ENTRY_UPDATE_VALIDATION_PASSED,
} from '../actions/timeEntry.actions';

export const initialState = {
  isFetching: false,
  error: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TIME_ENTRY_DELETE:
    case TIME_ENTRY_UPDATE:
    case TIME_ENTRY_PUBLISH: {
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
    case TIME_ENTRY_PUBLISH_VALIDATION_FAILED:
    case TIME_ENTRY_UPDATE_VALIDATION_FAILED: {
      return { ...state, error: action.data };
    }
    // Update state to render and clean the message errors:
    case TIME_ENTRY_PUBLISH_VALIDATION_PASSED:
    case TIME_ENTRY_UPDATE_VALIDATION_PASSED: {
      return { ...state, error: undefined };
    }
    default:
      return state;
  }
};
