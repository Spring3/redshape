import { UPDATE_SETTINGS } from '../actions';

const initialState = {
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SETTINGS: {
      return {
        ...state,
        ...action.data
      };
    }
    default:
      return state;
  }
};
