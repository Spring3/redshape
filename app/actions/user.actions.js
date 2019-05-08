import request, { login, notify } from './helper';
import { reset } from '../../modules/request';
import settingsActions from './settings.actions';

export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGOUT = 'USER_LOGOUT';
export const USER_GET_CURRENT = 'USER_GET_CURRENT';

const logout = () => (dispatch) => {
  reset();
  dispatch(settingsActions.backup());
  dispatch({ type: USER_LOGOUT });
};

const checkLogin = ({ username, password, redmineEndpoint }) => (dispatch) => {
  if (!redmineEndpoint) throw new Error('Unable to login to an undefined redmine endpoint');

  dispatch(notify.start(USER_LOGIN));

  return login({
    redmineEndpoint,
    url: '/users/current.json',
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`
    }
  }).then(({ data }) => {
    Object.assign(data.user, { redmineEndpoint });
    dispatch(notify.ok(USER_LOGIN, data));
    dispatch(settingsActions.restore());
  }).catch((error) => {
    console.error('Error when trying to get the info about current user', error);
    dispatch(notify.nok(USER_LOGIN, error));
  });
};

const getCurrent = () => (dispatch) => {
  dispatch(notify.start(USER_GET_CURRENT));

  return request({
    url: '/users/current.json',
    id: 'getCurrentUserInfo'
  }).then(({ data }) => dispatch(notify.ok(USER_GET_CURRENT, data)))
    .catch((error) => {
      console.error('Error when trying to get the info about current user', error);
      dispatch(notify.nok(USER_GET_CURRENT, error));
    });
};

export default {
  checkLogin,
  getCurrent,
  logout
};
