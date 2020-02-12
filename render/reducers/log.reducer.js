import { LOG_ADD } from '../actions/log.actions';

export const initialState = {
  data: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOG_ADD: {
      const { data } = action;
      return {
        data: [
          ...state.data,
          data
        ]
      };
    }
    default:
      return state;
  }
};
