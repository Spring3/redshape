import storage from '../../common/storage';
import {
  SETTINGS_ADVANCED_TIMER_CONTROLS,
  SETTINGS_DISCARD_IDLE_TIME,
  SETTINGS_IDLE_BEHAVIOR,
  SETTINGS_SHOW_CLOSED_ISSUES,
  SETTINGS_USE_COLORS,
  SETTINGS_ISSUE_HEADERS,
  SETTINGS_BACKUP,
  SETTINGS_RESTORE,
  SETTINGS_PROGRESS_SLIDER_STEP_1
} from '../actions/settings.actions';

export const initialState = {
  advancedTimerControls: false,
  progressWithStep1: false,
  idleBehavior: 0,
  discardIdleTime: false,
  showClosedIssues: false,
  useColors: false,
  issueHeaders: [
    { label: 'Id', isFixed: true, value: 'id' },
    { label: 'Subject', isFixed: true, value: 'subject' },
    { label: 'Project', value: 'project.name' },
    { label: 'Tracker', value: 'tracker.name' },
    { label: 'Status', value: 'status.name' },
    { label: 'Priority', value: 'priority.name' },
    { label: 'Estimation', value: 'estimated_hours' },
    { label: 'Due Date', value: 'due_date' }
  ]
};

const orderTableHeaders = (headers) => {
  const fixed = [];
  const unfixed = [];
  for (const header of headers) { // eslint-disable-line
    if (header.isFixed) {
      fixed.push(header);
    } else {
      unfixed.push(header);
    }
  }
  return [...fixed, ...unfixed];
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SETTINGS_ADVANCED_TIMER_CONTROLS: {
      const { userId, redmineEndpoint, advancedTimerControls } = action.data;
      const nextState = {
        ...state,
        advancedTimerControls,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_PROGRESS_SLIDER_STEP_1: {
      const { userId, redmineEndpoint, progressWithStep1 } = action.data;
      const nextState = {
        ...state,
        progressWithStep1,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_DISCARD_IDLE_TIME: {
      const { userId, redmineEndpoint, discardIdleTime } = action.data;
      const nextState = {
        ...state,
        discardIdleTime,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_IDLE_BEHAVIOR: {
      const { userId, redmineEndpoint, idleBehavior } = action.data;
      const nextState = {
        ...state,
        idleBehavior,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_SHOW_CLOSED_ISSUES: {
      const { userId, redmineEndpoint, showClosed } = action.data;
      const nextState = {
        ...state,
        showClosedIssues: !!showClosed
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_USE_COLORS: {
      const { userId, redmineEndpoint, useColors } = action.data;
      const nextState = {
        ...state,
        useColors: !!useColors
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_ISSUE_HEADERS: {
      const { userId, redmineEndpoint, issueHeaders } = action.data;
      const nextState = {
        ...state,
        issueHeaders: issueHeaders ? orderTableHeaders(issueHeaders) : state.issueHeaders
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_BACKUP: {
      const { userId, redmineEndpoint } = action.data;
      storage.set(`settings.${redmineEndpoint}.${userId}`, state);
      return state;
    }
    case SETTINGS_RESTORE: {
      const { userId, redmineEndpoint } = action.data;
      return storage.get(`settings.${redmineEndpoint}.${userId}`, initialState);
    }
    default:
      return state;
  }
};
