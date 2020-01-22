import storage from '../../common/storage';

import { version } from '../../package.json';

import {
  SETTINGS_IDLE_TIME_DISCARD,
  SETTINGS_IDLE_BEHAVIOR,
  SETTINGS_PROGRESS_SLIDER,
  SETTINGS_UI_STYLE,
  SETTINGS_SHOW_ADVANCED_TIMER_CONTROLS,
  SETTINGS_SHOW_CLOSED_ISSUES,
  SETTINGS_ISSUE_HEADERS,
  SETTINGS_BACKUP,
  SETTINGS_RESTORE,
  SETTINGS_ISSUE_ALWAYS_EDITABLE,
  SETTINGS_TIMER_CHECKPOINT,
} from '../actions/settings.actions';

export const initialState = {
  showAdvancedTimerControls: false,
  progressSlider: '10%',
  idleBehavior: 'none',
  idleTimeDiscard: false,
  showClosedIssues: false,
  uiStyle: 'default',
  issueHeaders: [
    { label: 'Id', isFixed: true, value: 'id', format: 'id' },
    { label: 'Subject', isFixed: true, value: 'subject' },
    { label: 'Project', value: 'project.name' },
    { label: 'Tracker', value: 'tracker.name', format: 'tracker' },
    { label: 'Status', value: 'status.name', format: 'status' },
    { label: 'Priority', value: 'priority.name', format: 'priority' },
    { label: 'Estimation', value: 'estimated_hours', format: 'hours' },
    { label: 'Due Date', value: 'due_date', format: 'date' }
  ],
  isIssueAlwaysEditable: false,
  timerCheckpoint: 'none',
  version,
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
    case SETTINGS_SHOW_ADVANCED_TIMER_CONTROLS: {
      const { userId, redmineEndpoint, showAdvancedTimerControls } = action.data;
      const nextState = {
        ...state,
        showAdvancedTimerControls,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_PROGRESS_SLIDER: {
      const { userId, redmineEndpoint, progressSlider } = action.data;
      const nextState = {
        ...state,
        progressSlider,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_IDLE_TIME_DISCARD: {
      const { userId, redmineEndpoint, idleTimeDiscard } = action.data;
      const nextState = {
        ...state,
        idleTimeDiscard,
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
      const { userId, redmineEndpoint, showClosedIssues } = action.data;
      const nextState = {
        ...state,
        showClosedIssues: !!showClosedIssues
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_UI_STYLE: {
      const { userId, redmineEndpoint, uiStyle } = action.data;
      const nextState = {
        ...state,
        uiStyle,
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
    case SETTINGS_ISSUE_ALWAYS_EDITABLE: {
      const { userId, redmineEndpoint, isIssueAlwaysEditable } = action.data;
      const nextState = {
        ...state,
        isIssueAlwaysEditable: !!isIssueAlwaysEditable
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_TIMER_CHECKPOINT: {
      const { userId, redmineEndpoint, timerCheckpoint } = action.data;
      const nextState = {
        ...state,
        timerCheckpoint,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    default:
      return state;
  }
};
