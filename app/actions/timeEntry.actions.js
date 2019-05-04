import _ from 'lodash';
import moment from 'moment';
import Joi from 'joi';
import request, { notify } from './helper';

export const TIME_ENTRY_PUBLISH_VALIDATION_FAILED = 'TIME_ENTRY_PUBLISH_VALIDATION_FAILED';
export const TIME_ENTRY_PUBLISH_VALIDATION_PASSED = 'TIME_ENTRY_PUBLISH_VALIDATION_PASSED';
export const TIME_ENTRY_PUBLISH = 'TIME_ENTRY_PUBLISH';
export const TIME_ENTRY_UPDATE_VALIDATION_FAILED = 'TIME_ENTRY_UPDATE_VALIDATION_FAILED';
export const TIME_ENTRY_UPDATE_VALIDATION_PASSED = 'TIME_ENTRY_UPDATE_VALIDATION_PASSED';
export const TIME_ENTRY_UPDATE = 'TIME_ENTRY_UPDATE';
export const TIME_ENTRY_DELETE = 'TIME_ENTRY_DELETE';
export const TIME_ENTRY_GET_ALL = 'TIME_ENTRY_GET_ALL';
export const TIME_ENTRY_RESET = 'TIME_ENTRY_RESET';

const validateBeforePublish = (timeEntry) => {
  const validationSchema = Joi.object().keys({
    activity: Joi.object().keys({
      id: Joi.number().integer().positive().required(),
      name: Joi.string()
    }).unknown().required(),
    issue: Joi.object().keys({
      id: Joi.number().integer().positive().required(),
      name: Joi.string()
    }).unknown().required(),
    hours: Joi.number().positive().precision(2).required(),
    comments: Joi.string().required().allow(''),
    spent_on: Joi.string().required()
  }).unknown().required();

  const validationResult = Joi.validate(timeEntry, validationSchema);
  return validationResult.error
    ? {
      type: TIME_ENTRY_PUBLISH_VALIDATION_FAILED,
      data: validationResult.error
    }
    : { type: TIME_ENTRY_PUBLISH_VALIDATION_PASSED };
};

const publish = timeEntryData => (dispatch, getState) => {
  const validationAction = validateBeforePublish(timeEntryData);
  dispatch(validationAction);

  if (validationAction.type === TIME_ENTRY_PUBLISH_VALIDATION_FAILED) {
    return Promise.resolve();
  }

  const { user = {} } = getState();
  dispatch(notify.start(TIME_ENTRY_PUBLISH));

  return request({
    url: '/time_entries.json',
    method: 'POST',
    data: {
      time_entry: {
        issue_id: timeEntryData.issue.id,
        spent_on: moment(timeEntryData.spent_on).format('YYYY-MM-DD'),
        hours: timeEntryData.hours,
        activity_id: timeEntryData.activity.id,
        comments: timeEntryData.comments,
        user_id: user.id || timeEntryData.user.id
      }
    }
  })
    .then(({ data }) => dispatch(notify.ok(TIME_ENTRY_PUBLISH, data)))
    .catch((error) => {
      console.error('Error when submitting the time entry', error);
      dispatch(notify.nok(TIME_ENTRY_PUBLISH, error));
    });
};

const validateBeforeUpdate = (changes) => {
  const validationSchema = Joi.object().keys({
    activity: Joi.object().keys({
      id: Joi.number().integer().positive().required(),
      name: Joi.string()
    }).unknown().required(),
    hours: Joi.number().positive().precision(2).required(),
    comments: Joi.string().required().allow(''),
    spent_on: Joi.string().required()
  }).unknown().required();

  const validationResult = Joi.validate(changes, validationSchema);
  return validationResult.error
    ? {
      type: TIME_ENTRY_UPDATE_VALIDATION_FAILED,
      data: validationResult.error
    }
    : { type: TIME_ENTRY_UPDATE_VALIDATION_PASSED };
};

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
      console.error('Error when trying to get the list of time entries', error);
      dispatch(notify.nok(TIME_ENTRY_GET_ALL, error));
    });
};

const reset = () => ({ type: TIME_ENTRY_RESET });

export default {
  publish,
  update,
  remove,
  getAll,
  validateBeforePublish,
  validateBeforeUpdate,
  reset
};
