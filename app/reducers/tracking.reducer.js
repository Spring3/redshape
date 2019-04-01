import moment from 'moment';
import {
  TRACKING_START,
  TRACKING_STOP,
  TRACKING_PAUSE,
  TRACKING_CONTINUE
} from '../actions/tracking.actions';
import storage from '../../modules/storage';

const initialState = {
  issue: {},
  isTracking: false,
  isPaused: false,
  duration: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TRACKING_START: {
      const nextState = state.isTracking
        ? state
        : {
          issue: action.issue,
          isTracking: true,
          isPaused: false,
          duration: 0
        };
      storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_STOP: {
      const nextState = {
        ...state,
        isTracking: false,
        isPaused: false,
        duration: action.duration
      };
      storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_PAUSE: {
      const nextState = {
        ...state,
        isPaused: true,
        duration: action.duration
      };
      storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_CONTINUE: {
      const nextState = {
        ...state,
        isPaused: false
      };
      storage.set('time_tracking', nextState);
      return nextState;
    }
    default:
      return state;
  }
};
