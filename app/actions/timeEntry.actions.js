import _ from 'lodash';
import moment from 'moment';
import request, { notify } from './helper';

export const TIME_ENTRY_PUBLISH = 'TIME_ENTRY_PUBLISH';
export const TIME_ENTRY_UPDATE = 'TIME_ENTRY_UPDATE';
export const TIME_ENTRY_DELETE = 'TIME_ENTRY_DELETE';
export const TIME_ENTRY_GET_ALL = 'TIME_ENTRY_GET_ALL';

const publish = timeEntry => (dispatch, getState) => {
  const { user = {} } = getState();

  dispatch(notify.start(TIME_ENTRY_PUBLISH));

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
    .then(({ data }) => dispatch(notify.ok(TIME_ENTRY_PUBLISH, data)))
    .catch((error) => {
      console.error('Error when submitting the time entry', error);
      dispatch(notify.nok(TIME_ENTRY_PUBLISH, error));
    });
};

const update = (timeEntry, changes) => (dispatch) => {
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
    return dispatch(notify.ok(TIME_ENTRY_UPDATE, updatedTimeEntry));
  })
    .catch((error) => {
      console.error('Error when updating the time entry', error);
      dispatch(notify.nok(TIME_ENTRY_UPDATE, error));
    });
};

const remove = (timeEntryId, issueId) => (dispatch) => {
  dispatch(notify.start(TIME_ENTRY_DELETE));
  if (!issueId) {
    dispatch(notify.nok(TIME_ENTRY_DELETE, new Error('issueId is required to delete the time entry')));
  }

  return request({
    url: `/time_entries/${timeEntryId}.json`,
    method: 'DELETE'
  }).then(() => dispatch(notify.ok(TIME_ENTRY_DELETE, { timeEntryId, issueId })))
    .catch((error) => {
      console.log(`Error when deleting the time entry with id ${timeEntryId}`, error);
      dispatch(notify.nok(TIME_ENTRY_DELETE, error));
    });
};

const getAll = (issueId, projectId, offset, limit) => (dispatch) => {
  const query = _({
    offset,
    limit,
    project_id: projectId,
    issue_id: issueId
  }).pickBy().value();

  dispatch(notify.start(TIME_ENTRY_GET_ALL));

  return request({
    url: '/time_entries.json',
    query,
    id: `getIssueTimeEntries:${issueId}:${offset}`
  }).then(({ data }) => dispatch(notify.ok(TIME_ENTRY_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get he list of time entries', error);
      dispatch(notify.nok(TIME_ENTRY_GET_ALL, error));
    });
};

export default {
  publish,
  update,
  remove,
  getAll
};
