import { isEqual as _isEqual } from 'lodash';
import moment from 'moment';
import Joi from '@hapi/joi';
import request, { notify } from './helper';

import { durationToHours, hoursToDuration } from '../datetime';

export const TIME_ENTRY_PUBLISH_VALIDATION_FAILED = 'TIME_ENTRY_PUBLISH_VALIDATION_FAILED';
export const TIME_ENTRY_PUBLISH_VALIDATION_PASSED = 'TIME_ENTRY_PUBLISH_VALIDATION_PASSED';
export const TIME_ENTRY_PUBLISH = 'TIME_ENTRY_PUBLISH';
export const TIME_ENTRY_UPDATE_VALIDATION_FAILED = 'TIME_ENTRY_UPDATE_VALIDATION_FAILED';
export const TIME_ENTRY_UPDATE_VALIDATION_PASSED = 'TIME_ENTRY_UPDATE_VALIDATION_PASSED';
export const TIME_ENTRY_UPDATE = 'TIME_ENTRY_UPDATE';
export const TIME_ENTRY_DELETE = 'TIME_ENTRY_DELETE';
export const TIME_ENTRY_RESET = 'TIME_ENTRY_RESET';

const validateDuration = (value, helpers) => {
  const hours = durationToHours(value);
  if (hours == null) {
    return helpers.message('"duration" requires a value in hours or a duration string (eg. 34m, 1 day 5m)');
  } if (hours <= 0) {
    return helpers.message(`"duration" requires a positive duration (${hours} hours)`);
  }
  return hours;
};

const validateBeforeCommon = (timeEntry, checkFields) => {
  let schema = {};
  const schemaFields = {
    activity: Joi.object().keys({
      // label: bugfix "activity.activity" is required, when "Add" new time spent and fill first the duration
      id: Joi.number().integer().positive().required()
        .label('activity'),
      name: Joi.string()
    }).unknown().required(),
    issue: Joi.object().keys({
      id: Joi.number().integer().positive().required(),
      name: Joi.string()
    }).unknown().required(),
    duration: Joi.string().required().custom(validateDuration, 'duration validator'),
    hours: Joi.number().positive().precision(2).required()
      .label('duration'),
    comments: Joi.string().required().allow(''),
    spent_on: Joi.string().required(),
    customFieldsMap: Joi.object()
  };
  if (checkFields) {
    if (!(checkFields instanceof Array)) {
      checkFields = [checkFields];
    }
    for (const checkField of checkFields) {
      schema[checkField] = schemaFields[checkField];
    }
  } else {
    schema = schemaFields;
  }
  const validationSchema = Joi.object().keys(schema).unknown().required();
  const validationResult = validationSchema.validate(timeEntry);
  return validationResult;
};

const validateBeforePublish = (timeEntry, checkFields) => {
  const validationResult = validateBeforeCommon(timeEntry, checkFields);
  return validationResult.error
    ? {
      type: TIME_ENTRY_PUBLISH_VALIDATION_FAILED,
      data: validationResult.error
    }
    : { type: TIME_ENTRY_PUBLISH_VALIDATION_PASSED };
};

/**
 * @param fieldsData - used if editing custom fields
 */
const publish = (timeEntryData, extra) => (dispatch, getState) => {
  const validationAction = validateBeforePublish(timeEntryData);
  dispatch(validationAction);

  if (validationAction.type === TIME_ENTRY_PUBLISH_VALIDATION_FAILED) {
    return Promise.resolve();
  }

  const { user = {} } = getState();

  const timeEntry = {
    issue_id: timeEntryData.issue.id,
    spent_on: moment(timeEntryData.spent_on).format('YYYY-MM-DD'),
    hours: timeEntryData.hours,
    activity_id: timeEntryData.activity.id,
    comments: timeEntryData.comments,
    user_id: user.id || timeEntryData.user.id
  };

  const fieldsData = extra && extra.fieldsData;

  const { customFieldsMap } = timeEntryData;
  if (customFieldsMap != null && fieldsData && fieldsData.time_entry) {
    const customFields = fieldsData.time_entry.map(({ id, multiple, name }) => {
      const value = customFieldsMap[name];
      return { id, name, value };
    }).filter(el => el != null);
    if (customFields.length) {
      timeEntry.custom_fields = customFields;
    }
  }

  dispatch(notify.start(TIME_ENTRY_PUBLISH));

  return request({
    url: '/time_entries.json',
    method: 'POST',
    data: {
      time_entry: timeEntry
    }
  })
    .then(({ data }) => dispatch(notify.ok(TIME_ENTRY_PUBLISH, data)))
    .catch((error) => {
      console.error('Error when submitting the time entry', error);
      dispatch(notify.nok(TIME_ENTRY_PUBLISH, error));
    });
};

const validateBeforeUpdate = (timeEntry, checkFields) => {
  if (!checkFields) {
    checkFields = ['activity', 'duration', 'hours', 'comments', 'spent_on', 'customFieldsMap'];
  }
  const validationResult = validateBeforeCommon(timeEntry, checkFields);
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

  const updates = {};

  const { hours } = changes;
  if (originalTimeEntry.hours !== hours) {
    updates.hours = hours;
  }
  const { comments } = changes;
  if (originalTimeEntry.comments !== comments) {
    updates.comments = comments;
  }
  const spent_on = changes.spent_on || null;
  if (originalTimeEntry.spent_on !== spent_on) {
    updates.spent_on = moment(changes.spent_on).format('YYYY-MM-DD');
  }
  const activity_id = changes.activity && changes.activity.id;
  if (originalTimeEntry.activity.id !== activity_id) {
    updates.activity_id = activity_id;
  }

  const { customFieldsMap } = changes;
  if (customFieldsMap != null && originalTimeEntry.custom_fields != null) {
    const customFieldsChanges = originalTimeEntry.custom_fields.map(({
      id, multiple, name, value
    }) => {
      let changed = customFieldsMap[name];
      if (multiple) { // mutate arrays, compare values
        value = value ? value.sort() : value;
        changed = changed ? changed.sort() : changed;
      }
      return _isEqual(changed, value) ? null : { id, name, value: changed };
    }).filter(el => el != null);
    if (customFieldsChanges.length) {
      updates.custom_fields = customFieldsChanges;
    }
  }

  if (!Object.keys(updates).length) {
    return Promise.resolve({ unchanged: true });
  }
  updates.id = originalTimeEntry.id;

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
      ...updates
    };
    if (updates.activity_id != null) {
      updatedTimeEntry.activity = changes.activity;
      delete updatedTimeEntry.activity_id;
    }
    if (updates.custom_fields) {
      const updatedFields = Object.fromEntries(updates.custom_fields.map(el => [el.id, el.value]));
      updatedTimeEntry.custom_fields = originalTimeEntry.custom_fields.map((el) => {
        const { id } = el;
        if (updatedFields.hasOwnProperty(id)) {
          el.value = updatedFields[id];
        }
        return el;
      });
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
      console.error(`Error when deleting the time entry with id ${timeEntryId}`, error);
      dispatch(notify.nok(TIME_ENTRY_DELETE, error));
    });
};

const reset = () => ({ type: TIME_ENTRY_RESET });

export default {
  publish,
  update,
  remove,
  validateBeforePublish,
  validateBeforeUpdate,
  reset
};
