import { LOG_ADD, STATUSBAR_SET } from '../actions/session.actions';

export const initialState = {
  log: [],
  statusBar: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOG_ADD: {
      const { data } = action;
      return {
        ...state,
        log: [
          ...state.log,
          data
        ]
      };
    }
    case STATUSBAR_SET: {
      const { data } = action;
      return {
        ...state,
        statusBar: data
      };
    }
    default:
      return state;
  }
};
