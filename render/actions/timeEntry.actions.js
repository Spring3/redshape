import _ from 'lodash';
import moment from 'moment';
import request, { notify } from './helper';

export const TIME_ENTRY_UPDATE_VALIDATION_FAILED = 'TIME_ENTRY_UPDATE_VALIDATION_FAILED';
export const TIME_ENTRY_UPDATE_VALIDATION_PASSED = 'TIME_ENTRY_UPDATE_VALIDATION_PASSED';
export const TIME_ENTRY_UPDATE = 'TIME_ENTRY_UPDATE';

const update = (originalTimeEntry, changes) => (dispatch) => {
  const validateAction = validateBeforeUpdate(changes);
  dispatch(validateAction);

  if (validateAction.type === TIME_ENTRY_UPDATE_VALIDATION_FAILED) {
    return Promise.resolve();
  }

  const mergeable = _.pick(changes, 'comments', 'hours', {});

  const updates = {
    ...mergeable
  };

  if (changes.activity) {
    updates.activity_id = changes.activity.id;
  }

  if (changes.spent_on) {
    updates.spent_on = moment(changes.spent_on).format('YYYY-MM-DD');
  }

  dispatch(notify.start(TIME_ENTRY_UPDATE));

  return request({
    url: `/time_entries/${originalTimeEntry.id}.json`,
    method: 'PUT',
    data: {
      time_entry: updates
    },
  }).then(() => {
    const updatedTimeEntry = {
      ...originalTimeEntry,
      spent_on: updates.spent_on,
      comments: updates.comments,
      hours: updates.hours,
    };
    if (changes.activity) {
      updatedTimeEntry.activity = changes.activity;
    }
    return dispatch(notify.ok(TIME_ENTRY_UPDATE, updatedTimeEntry));
  })
    .catch((error) => {
      // eslint-disable-next-line
      console.error('Error when updating the time entry', error);
      dispatch(notify.nok(TIME_ENTRY_UPDATE, error));
    });
};

export default {
  update,
};
