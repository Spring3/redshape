import moment from 'moment';
import { notify } from './helper';

export const LOG_ADD = 'LOG_ADD';

const add = reg => (dispatch) => {
  if (typeof reg === 'string') {
    reg = { message: reg };
  }
  if (!reg.date) {
    reg.date = new Date();
  }
  reg.date = moment(reg.date).format('YYYY-MM-DD HH:mm:ss');

  dispatch(notify.ok(LOG_ADD, reg));
};

export default {
  add
};
