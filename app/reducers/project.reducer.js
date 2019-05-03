import _ from 'lodash';

import storage from '../../modules/storage';
import { PROJECT_GET_ALL } from '../actions/project.actions';

const initialState = {
  data: {},
  fetchedOffset: 0,
  isFetching: false,
  error: undefined
};

const convertProjectsArray = (projectPages = []) => {
  const result = {};
  projectPages.forEach((projectPage) => {
    const projects = _.get(projectPage, 'projects', []);
    projects.forEach(({ id, name, time_entry_activities }) => {
      result[id] = {
        id,
        name,
        activities: time_entry_activities
      };
    });
  });
  return result;
};

export default (state = initialState, action) => {
  switch (action.type) {
    case PROJECT_GET_ALL: {
      switch (action.status) {
        case 'START': {
          return { ...state, isFetching: true };
        }
        case 'PAGE_NEXT': {
          const projects = convertProjectsArray(action.data);
          return {
            ...state,
            data: {
              ...state.data,
              ...projects
            },
            error: undefined
          };
        }
        case 'OK': {
          const projects = convertProjectsArray(action.data);
          const nextState = {
            ...state,
            isFetching: false,
            data: {
              ...state.data,
              ...projects
            },
            error: undefined
          };
          storage.set('projects', nextState);
          return nextState;
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
