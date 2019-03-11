export const LOGIN = 'LOGIN';
const login = data => ({ type: LOGIN, data });

export const LOGOUT = 'LOGOUT';
const logout = () => ({ type: LOGOUT });

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
const updateSettings = data => ({ type: UPDATE_SETTINGS, data });

export default {
  user: {
    login,
    logout
  },
  settings: {
    update: updateSettings
  }
};
