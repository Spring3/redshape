import {
  TRACKING_START,
  TRACKING_STOP,
  TRACKING_PAUSE,
  TRACKING_CONTINUE,
  TRACKING_RESET
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
      if (state.isTracking) {
        return state;
      }
      const { issue } = action.data;
      const nextState = {
        issue,
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
        duration: action.data.duration
      };
      console.log('STOP', nextState);
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
        isPaused: false
      };
      storage.set('time_tracking', nextState);
      return nextState;
    }
    default:
      return state;
  }
};
