import {
  TRACKING_START,
  TRACKING_STOP,
  TRACKING_PAUSE,
  TRACKING_CONTINUE,
  TRACKING_SAVE,
  TRACKING_RESET
} from '../actions/tracking.actions';
// import storage from '../../common/storage';

export const initialState = {
  issue: {},
  isEnabled: false,
  isPaused: false,
  duration: 0,
  comments: ''
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TRACKING_START: {
      const { issue } = action.data;
      const nextState = {
        issue,
        isEnabled: true,
        isPaused: false,
        duration: 0,
        comments: '',
      };
      // storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_STOP: {
      const { duration, comments } = action.data;
      const nextState = {
        ...state,
        isEnabled: false,
        isPaused: false,
        duration,
        comments,
      };
      // storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_PAUSE: {
      const { duration, comments } = action.data;
      const nextState = {
        ...state,
        isPaused: true,
        duration,
        comments,
      };
      // storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_CONTINUE: {
      const { duration, comments } = action.data;
      const nextState = {
        ...state,
        isPaused: false,
        duration: duration || state.duration,
        comments: comments || state.comments,
      };
      // storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_SAVE: {
      const { duration, comments } = action.data;
      const nextState = {
        ...state,
        duration,
        comments,
      };
      // storage.set('time_tracking', nextState);
      return nextState;
    }
    case TRACKING_RESET: {
      // storage.delete('time_tracking');
      return initialState;
    }
    default:
      return state;
  }
};
