import storage from '../../modules/storage';
import {
  SETTINGS_USE_CORS,
  SETTINGS_SHOW_CLOSED_ISSUES,
  SETTINGS_USE_COLORS
} from '../actions/settings.actions';

const initialState = {
  useCors: false,
  showClosedIssues: false,
  useColors: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SETTINGS_USE_CORS: {
      const nextState = {
        ...state,
        useCors: !!action.data
      };
      storage.set('settings', nextState);
      return nextState;
    }
    case SETTINGS_SHOW_CLOSED_ISSUES: {
      const nextState = {
        ...state,
        showClosedIssues: !!action.data
      };
      storage.set('settings', nextState);
      return nextState;
    }
    case SETTINGS_USE_COLORS: {
      const nextState = {
        ...state,
        useColors: !!action.data
      };
      storage.set('settings', nextState);
      return nextState;
    }
    default:
      return state;
  }
};
