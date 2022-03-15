import _ from 'lodash';

import {
  TIME_ENTRY_UPDATE,
} from '../actions/timeEntry.actions';

export const initialState = {
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
    case TIME_ENTRY_UPDATE: {
      if (action.status === 'OK') {
        const issueId = _.get(action.data, 'issue.id');
        if (issueId === state.data.id) {
          const nextState = {
            ...state,
            spentTime: {
              ...state.spentTime,
              data: [...state.spentTime.data].map(
                (entry) => (entry.id === action.data.id ? action.data : entry)
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
    default:
      return state;
  }
};
