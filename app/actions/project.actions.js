import request, { notify } from './helper';

export const PROJECT_GET_ALL = 'PROJECT_GET_ALL';

const getAll = () => (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;

  dispatch(notify.start(PROJECT_GET_ALL));
  return request({
    url: `${redmineEndpoint}/projects.json?include=time_entry_activities`,
    token: api_key
  })
    .then(({ data }) => dispatch(notify.ok(PROJECT_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get the info about the existing projects', error);
      dispatch(notify.nok(PROJECT_GET_ALL, error));
    });
};

export default {
  getAll
};
