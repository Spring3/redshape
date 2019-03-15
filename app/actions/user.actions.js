import request, { notify } from './helper';

export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGOUT = 'USER_LOGOUT';
export const USER_GET_ALL = 'USER_GET_ALL';
export const USER_GET_CURRENT = 'USER_GET_CURRENT';

const logout = () => ({ type: USER_LOGOUT });

const checkLogin = ({ username, password, redmineEndpoint }) => (dispatch) => {
  if (!redmineEndpoint) throw new Error('Unable to login to an undefined redmine endpoint');

  const headers = {
    Authorization: `Basic ${btoa(`${username}:${password}`)}`
  };

  dispatch(notify.start(USER_LOGIN));

  return request({
    url: `${redmineEndpoint}/users/current.json`,
    requestHeaders: headers
  }).then(({ data }) => {
    Object.assign(data.user, { redmineEndpoint });
    dispatch(notify.ok(USER_LOGIN, data));
  }).catch((error) => {
    console.error('Error when trying to get the info about current user', error);
    dispatch(notify.nok(USER_LOGIN, error));
  });
};

const getAll = groupId => (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;
  let url = `${redmineEndpoint}/users.json?`;

  if (groupId) {
    url += `&group_id=${groupId}`;
  }

  dispatch(notify.start(USER_GET_ALL));

  return request({
    url,
    token: api_key,
  }).then(({ data }) => dispatch(notify.ok(USER_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get the list of users', error);
      dispatch(notify.nok(USER_GET_ALL, error));
    });
};

const getCurrent = () => (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;

  dispatch(notify.start(USER_GET_CURRENT));

  return request({
    url: `${redmineEndpoint}/users/current.json`,
    token: api_key
  }).then(({ data }) => dispatch(notify.ok(USER_GET_CURRENT, data)))
    .catch((error) => {
      console.error('Error when trying to get the info about current user', error);
      dispatch(notify.nok(USER_GET_CURRENT, error));
    });
};

export default {
  checkLogin,
  getAll,
  getCurrent,
  logout
};
