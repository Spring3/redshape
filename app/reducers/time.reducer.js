import {
  TIME_ADD,
  TIME_UPDATE,
  TIME_DELETE
} from '../actions/time.actions';

const initialState = {
  isFetching: false,
  error: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TIME_DELETE:
    case TIME_UPDATE:
    case TIME_ADD: {
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
