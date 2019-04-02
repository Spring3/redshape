import _ from 'lodash';

import storage from '../../modules/storage';
import { PROJECT_GET_ALL } from '../actions/project.actions';

const initialState = {
  data: {},
  fetchedOffset: 0,
  isFetching: false,
  error: undefined
};

export default (state = initialState, action) => {
  switch (action.type) {
    case PROJECT_GET_ALL: {
      switch (action.status) {
        case 'START': {
          return { ...state, isFetching: true };
        }
        case 'OK': {
          const projects = _.get(action.data, 'projects', []).reduce((acc, project) => {
            const { id, time_entry_activities } = project;
            acc[id] = {
              id,
              activities: time_entry_activities
            };
            return acc;
          }, {});
          storage.set('projects', projects);
          return {
            ...state,
            isFetching: false,
            data: projects,
            error: undefined
          };
        }
        case 'NOK': {
          return { ...state, isFetching: false, error: action.data };
        }
        default:
          return state;
      }
    }
    default:
      return state;
  }
};
