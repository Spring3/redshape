import _ from 'lodash';
import moment from 'moment';
import request, { notify } from './helper';

export const TIME_ADD = 'TIME_ADD';
export const TIME_UPDATE = 'TIME_UPDATE';
export const TIME_DELETE = 'TIME_DELETE';
export const TIME_GET_ALL = 'TIME_GET_ALL';

const add = timeEntry => (dispatch, getState) => {
  const { user = {} } = getState();

  dispatch(notify.start(TIME_ADD));

  return request({
    url: '/time_entries.json',
    method: 'POST',
    data: {
      time_entry: {
        issue_id: timeEntry.issue.id,
        spent_on: moment(timeEntry.spent_on).format('YYYY-MM-DD'),
        hours: timeEntry.hours,
        activity_id: timeEntry.activity.id,
        comments: timeEntry.comments,
        user_id: user.id || timeEntry.user.id
      }
    }
  })
    .then(({ data }) => dispatch(notify.ok(TIME_ADD, data)))
    .catch((error) => {
      console.error('Error when submitting the time entry', error);
      dispatch(notify.nok(TIME_ADD, error));
    });
};

const update = (timeEntry, changes) => (dispatch) => {
  const mergeable = _.pick(changes, 'comments', 'hours');

  const updates = {
    ...mergeable
  };

  if (changes.activity) {
    updates.activity_id = changes.activity.id;
  }

  if (changes.spent_on) {
    updates.spent_on = moment(changes.spent_on).format('YYYY-MM-DD');
  }

  dispatch(notify.start(TIME_UPDATE));

  return request({
    url: `/time_entries/${timeEntry.id}.json`,
    method: 'PUT',
    data: {
      time_entry: updates
    },
  }).then(() => {
    const updatedTimeEntry = {
      ...timeEntry,
      spent_on: updates.spent_on,
      comments: updates.comments,
      hours: updates.hours,
    };
    if (changes.activity) {
      updatedTimeEntry.activity = changes.activity;
    }
    return dispatch(notify.ok(TIME_UPDATE, updatedTimeEntry));
  })
    .catch((error) => {
      console.error('Error when updating the time entry', error);
      dispatch(notify.nok(TIME_UPDATE, error));
    });
};

const remove = (timeEntryId, issueId) => (dispatch) => {
  dispatch(notify.start(TIME_DELETE));
  if (!issueId) {
    dispatch(notify.nok(TIME_DELETE, new Error('issueId is required to delete the time entry')));
  }

  return request({
    url: `/time_entries/${timeEntryId}.json`,
    method: 'DELETE'
  }).then(() => dispatch(notify.ok(TIME_DELETE, { timeEntryId, issueId })))
    .catch((error) => {
      console.log(`Error when deleting the time entry with id ${timeEntryId}`, error);
      dispatch(notify.nok(TIME_DELETE, error));
    });
};

const getAll = (issueId, projectId, offset, limit) => (dispatch) => {
  const params = {
    offset,
    limit,
    project_id: projectId,
    issue_id: issueId
  };

  const queryParams = new URLSearchParams(_(params).pickBy().value()).toString();
  const url = `/time_entries.json?${queryParams}`;

  dispatch(notify.start(TIME_GET_ALL));

  return request({
    url,
    id: `getIssueTimeEntries:${issueId}:${offset}`
  }).then(({ data }) => dispatch(notify.ok(TIME_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get he list of time entries', error);
      dispatch(notify.nok(TIME_GET_ALL, error));
    });
};

export default {
  add,
  update,
  remove,
  getAll
};
