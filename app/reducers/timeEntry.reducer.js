import {
  TIME_ENTRY_ADD,
  TIME_ENTRY_UPDATE,
  TIME_ENTRY_DELETE
} from '../actions/timeEntry.actions';

const initialState = {
  isFetching: false,
  error: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TIME_ENTRY_DELETE:
    case TIME_ENTRY_UPDATE:
    case TIME_ENTRY_ADD: {
      if (action.status === 'START') {
        return { ...state, isFetching: true };
      }
      if (action.status === 'OK') {
        return { ...state, isFetching: false, error: undefined };
      }
      if (action.status === 'NOK') {
        return { ...state, isFetching: true, error: action.data };
      }
      return state;
    }
    default:
      return state;
  }
};
