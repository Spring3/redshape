import storage from '../../modules/storage';
import {
  SETTINGS_USE_CORS,
  SETTINGS_SHOW_CLOSED_ISSUES,
  SETTINGS_USE_COLORS,
  SETTINGS_ISSUE_HEADERS,
  SETTINGS_BACKUP,
  SETTINGS_RESTORE
} from '../actions/settings.actions';

export const initialState = {
  useCors: false,
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
    case SETTINGS_USE_CORS: {
      const { userId, redmineEndpoint, useCors } = action.data;
      const nextState = {
        ...state,
        useCors: !!useCors
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
        issueHeaders: orderTableHeaders(issueHeaders)
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
