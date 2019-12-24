import {
  TRACKING_START,
  TRACKING_STOP,
  TRACKING_PAUSE,
  TRACKING_CONTINUE,
  TRACKING_RESET
} from '../actions/tracking.actions';
import storage from '../../common/storage';

export const initialState = {
  issue: {},
  isEnabled: false,
  isPaused: false,
  duration: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TRACKING_START: {
      if (state.isTracking) {
        return state;
      }
      const { issue } = action.data;
      const nextState = {
        issue,
        isEnabled: true,
        isPaused: false,
        duration: 0
      };
      storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_STOP: {
      const nextState = {
        ...state,
        isEnabled: false,
        isPaused: false,
        duration: action.data.duration
      };
      storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_PAUSE: {
      const nextState = {
        ...state,
        isPaused: true,
        duration: action.data.duration
      };
      storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_CONTINUE: {
      const nextState = {
        ...state,
        isPaused: false,
        duration: action.data.duration || state.duration
      };
      storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_RESET: {
      storage.delete('time_tracking');
      return initialState;
    }
    default:
      return state;
  }
};
