import moment from 'moment';
import { notify } from './helper';

/**
 * Temporary usage or working session. Usually, it will live with the window/app.
 */

export const LOG_ADD = 'LOG_ADD';
export const STATUSBAR_SET = 'STATUSBAR_SET';

const addLog = reg => (dispatch) => {
  if (typeof reg === 'string') {
    reg = { message: reg };
  }
  if (!reg.date) {
    reg.date = new Date();
  }
  reg.date = moment(reg.date).format('YYYY-MM-DD HH:mm:ss');

  dispatch(notify.ok(LOG_ADD, reg));
};

const setStatusBar = (value = '') => (dispatch) => {
  dispatch(notify.ok(STATUSBAR_SET, value));
};

export default {
  addLog,
  setStatusBar
};
