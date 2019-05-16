import _ from 'lodash';

import {
  ISSUES_GET,
  ISSUES_COMMENTS_SEND,
  ISSUES_RESET_SELECTION,
  ISSUES_TIME_ENTRY_GET
} from '../actions/issues.actions';

import {
  TIME_ENTRY_PUBLISH,
  TIME_ENTRY_UPDATE,
  TIME_ENTRY_DELETE,
} from '../actions/timeEntry.actions';

const initialState = {
  data: {},
  spentTime: {
    page: 0,
    limit: 20,
    totalCount: 0,
    data: [],
    isFetching: false,
    error: undefined
  },
  isFetching: false,
  error: undefined,
  updates: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ISSUES_RESET_SELECTION: {
      return initialState;
    }
    case ISSUES_GET: {
      if (action.status === 'START') {
        return { ...state, isFetching: true };
      }
      if (action.status === 'OK') {
        return { ...state, isFetching: false, data: _.get(action.data, 'issue', {}), error: undefined };
      }
      if (action.status === 'NOK') {
        return { ...state, isFetching: false, error: action.data };
      }
      return state;
    }
    case ISSUES_COMMENTS_SEND: {
      if (action.status === 'START') {
        return {
          ...state,
          updates: {
            ...state.updateStatus,
            [action.info.subject]: {
              ok: false,
              isUpdating: true,
              error: undefined
            }
          }
        };
      }
      if (action.status === 'OK') {
        return {
          ...state,
          data: {
            ...state.data,
            journals: [...state.data.journals, action.data]
          },
          updates: {
            ...state.updateStatus,
            [action.info.subject]: {
              ok: true,
              isUpdating: false,
              error: undefined
            }
          }
        };
      }
      if (action.status === 'NOK') {
        return {
          ...state,
          updates: {
            ...state.updateStatus,
            [action.info.subject]: {
              ok: false,
              isUpdating: false,
              error: action.data
            }
          }
        };
      }
      return state;
    }
    case ISSUES_TIME_ENTRY_GET: {
      if (action.status === 'START') {
        return {
          ...state,
          spentTime: {
            ...state.spentTime,
            isFetching: true,
            page: {}.hasOwnProperty.call(action.info, 'page') ? action.info.page : state.spentTime.page
          }
        };
      }
      if (action.status === 'OK') {
        return {
          ...state,
          spentTime: {
            ...state.spentTime,
            isFetching: false,
            data: action.info.page === 0
              ? _.get(action.data, 'time_entries', [])
              : [...state.spentTime.data, ..._.get(action.data, 'time_entries', [])],
            totalCount: action.data.total_count,
            error: undefined
          }
        };
      }
      if (action.status === 'NOK') {
        return {
          ...state,
          spentTime: {
            ...state.spentTime,
            isFetching: false,
            error: action.data
          }
        };
      }
      return state;
    }
    case TIME_ENTRY_PUBLISH: {
      if (action.status === 'OK') {
        const timeEntry = _.get(action.data, 'time_entry', {});
        const issueId = _.get(timeEntry, 'issue.id');
        if (issueId === state.data.id) {
          return {
            ...state,
            data: {
              ...state.data,
              spent_hours: state.data.spent_hours + timeEntry.hours,
              total_spent_hours: state.data.total_spent_hours + timeEntry.hours
            },
            spentTime: {
              ...state.spentTime,
              data: [
                timeEntry,
                ...state.spentTime.data
              ]
            }
          };
        }
      }
      return state;
    }
    case TIME_ENTRY_UPDATE: {
      if (action.status === 'OK') {
        const issueId = _.get(action.data, 'issue.id');
        if (issueId === state.data.id) {
          const nextState = {
            ...state,
            spentTime: {
              ...state.spentTime,
              data: [...state.spentTime.data].map(
                entry => (entry.id === action.data.id ? action.data : entry)
              )
            }
          };
          const newTotalTimeSpent = nextState.spentTime.data.reduce((acc, entry) => acc + entry.hours, 0);
          nextState.data = {
            ...nextState.data,
            spent_hours: newTotalTimeSpent,
            total_spent_hours: newTotalTimeSpent
          };
          return nextState;
        }
      }
      return state;
    }
    case TIME_ENTRY_DELETE: {
      if (action.status === 'OK') {
        const { issueId, timeEntryId } = action.data;
        if (issueId === state.data.id) {
          const nextState = {
            ...state,
            spentTime: {
              ...state.spentTime,
              data: [...state.spentTime.data.filter(({ id }) => id !== timeEntryId)]
            }
          };
          const newTotalTimeSpent = nextState.spentTime.data.reduce((acc, entry) => acc + entry.hours, 0);
          nextState.data = {
            ...nextState.data,
            spent_hours: newTotalTimeSpent,
            total_spent_hours: newTotalTimeSpent
          };
          return nextState;
        }
      }
      return state;
    }
    default:
      return state;
  }
};
