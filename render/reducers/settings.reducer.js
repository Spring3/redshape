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
      const { advancedTimerControls } = action.data;
      const nextState = {
        ...state,
        advancedTimerControls,
      };
      return nextState;
    }
    case SETTINGS_PROGRESS_SLIDER_STEP_1: {
      const { progressWithStep1 } = action.data;
      const nextState = {
        ...state,
        progressWithStep1,
      };
      return nextState;
    }
    case SETTINGS_DISCARD_IDLE_TIME: {
      const { discardIdleTime } = action.data;
      const nextState = {
        ...state,
        discardIdleTime,
      };
      return nextState;
    }
    case SETTINGS_IDLE_BEHAVIOR: {
      const { idleBehavior } = action.data;
      const nextState = {
        ...state,
        idleBehavior,
      };
      return nextState;
    }
    case SETTINGS_SHOW_CLOSED_ISSUES: {
      const { showClosed } = action.data;
      const nextState = {
        ...state,
        showClosedIssues: !!showClosed
      };
      return nextState;
    }
    case SETTINGS_USE_COLORS: {
      const { useColors } = action.data;
      const nextState = {
        ...state,
        useColors: !!useColors
      };
      return nextState;
    }
    case SETTINGS_ISSUE_HEADERS: {
      const { issueHeaders } = action.data;
      const nextState = {
        ...state,
        issueHeaders: issueHeaders ? orderTableHeaders(issueHeaders) : state.issueHeaders
      };
      return nextState;
    }
    case SETTINGS_BACKUP: {
      return state;
    }
    case SETTINGS_RESTORE: {
      return initialState;
    }
    default:
      return state;
  }
};
