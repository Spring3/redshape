import _ from 'lodash';
import moment from 'moment';
import Joi from '@hapi/joi';
import request, { notify } from './helper';

import { durationToHours } from '../datetime';

export const TIME_ENTRY_PUBLISH_VALIDATION_FAILED = 'TIME_ENTRY_PUBLISH_VALIDATION_FAILED';
export const TIME_ENTRY_PUBLISH_VALIDATION_PASSED = 'TIME_ENTRY_PUBLISH_VALIDATION_PASSED';
export const TIME_ENTRY_PUBLISH = 'TIME_ENTRY_PUBLISH';
export const TIME_ENTRY_UPDATE_VALIDATION_FAILED = 'TIME_ENTRY_UPDATE_VALIDATION_FAILED';
export const TIME_ENTRY_UPDATE_VALIDATION_PASSED = 'TIME_ENTRY_UPDATE_VALIDATION_PASSED';
export const TIME_ENTRY_UPDATE = 'TIME_ENTRY_UPDATE';

const validateDuration = (value, helpers) => {
  const hours = durationToHours(value);
  if (hours == null) {
    return helpers.message('"duration" requires a value in hours or a duration string (eg. 34m, 1 day 5m)');
  }
  if (hours <= 0.0) {
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
    hours: Joi.number().positive().precision(4).required()
      .label('duration'),
    comments: Joi.string().required().allow(''),
    spent_on: Joi.string().required()
  };
  const fields = checkFields && !Array.isArray(checkFields) ? [checkFields] : checkFields;
  if (checkFields) {
    for (const checkField of fields) {
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

const publish = (timeEntryData) => (dispatch, getState) => {
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
      // eslint-disable-next-line
      console.error('Error when submitting the time entry', error);
      dispatch(notify.nok(TIME_ENTRY_PUBLISH, error));
    });
};

const validateBeforeUpdate = (timeEntry, checkFields) => {
  if (!checkFields) {
    // eslint-disable-next-line no-param-reassign
    checkFields = ['activity', 'duration', 'hours', 'comments', 'spent_on'];
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
  publish,
  update,
  validateBeforePublish,
  validateBeforeUpdate,
};
