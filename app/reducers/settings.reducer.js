import storage from '../../modules/storage';
import {
  SETTINGS_USE_CORS,
  SETTINGS_SHOW_CLOSED_ISSUES,
  SETTINGS_USE_COLORS,
  SETTINGS_ISSUE_HEADERS
} from '../actions/settings.actions';

const initialState = {
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
  for (const header of headers) {
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
    case SETTINGS_ISSUE_HEADERS: {
      const nextState = {
        ...state,
        issueHeaders: orderTableHeaders(action.data)
      };
      storage.set('settings', nextState);
      return nextState;
    }
    default:
      return state;
  }
};
