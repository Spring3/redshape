import Joi from '@hapi/joi';
import moment from 'moment';
import { isEqual as _isEqual } from 'lodash';
import request, { notify } from './helper';

import { durationToHours, hoursToDuration } from '../datetime';

export const ISSUE_UPDATE = 'ISSUE_UPDATE';
export const ISSUE_RESET = 'ISSUE_RESET';
export const ISSUE_UPDATE_VALIDATION_FAILED = 'ISSUE_UPDATE_VALIDATION_FAILED';
export const ISSUE_UPDATE_VALIDATION_PASSED = 'ISSUE_UPDATE_VALIDATION_PASSED';

const validateEstimatedDuration = (value, helpers) => {
  const hours = durationToHours(value);
  if (hours == null) {
    return helpers.message('"estimation" requires a value in hours, a duration string (eg. 34m, 1 day 5m) or an empty string');
  } if (hours <= 0) {
    return helpers.message(`"estimation" requires a positive duration (${hours} hours)`);
  }
  return hours;
};

const validateDate = (value, helpers) => {
  const validDate = moment(value).isValid();
  if (validDate || value === '') {
    return value;
  }
  return helpers.message('"due_date" requires a valid date or an empty string');
};

const validateBeforeCommon = (issueEntry, checkFields) => {
  let schema = {
  };
  const schemaFields = {
    progress: Joi.number().integer().min(0).max(100)
      .allow(''), // done_ratio
    estimated_duration: Joi.string().custom(validateEstimatedDuration, 'estimated duration validator').allow(''),
    due_date: Joi.string().custom(validateDate, 'due date validation').allow(null, ''),
    status: Joi.object().keys({
      value: Joi.number().integer().required(),
      label: Joi.string().required(),
    }),
    priority: Joi.object().keys({
      value: Joi.number().integer().required(),
      label: Joi.string().required(),
    }),
    assigned_to: Joi.object().keys({
      value: Joi.number().integer().required(),
      label: Joi.string().required(),
    }).allow(null),
    customFieldsMap: Joi.object(),
    description: Joi.string().allow(null, ''),
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
  const validationResult = validationSchema.validate(issueEntry);
  return validationResult;
};

const validateBeforeUpdate = (issueEntry, checkFields) => {
  if (!checkFields) {
    checkFields = ['progress', 'estimated_duration', 'due_date', 'status', 'priority', 'assigned_to', 'customFieldsMap', 'description'];
  }
  const validationResult = validateBeforeCommon(issueEntry, checkFields);
  return validationResult.error
    ? {
      type: ISSUE_UPDATE_VALIDATION_FAILED,
      data: validationResult.error
    }
    : { type: ISSUE_UPDATE_VALIDATION_PASSED };
};

const update = (originalIssueEntry, changes) => (dispatch) => {
  const validateAction = validateBeforeUpdate(changes);
  dispatch(validateAction);

  if (validateAction.type === ISSUE_UPDATE_VALIDATION_FAILED) {
    return Promise.resolve();
  }

  const updates = {};

  const estimated_hours = durationToHours(changes.estimated_duration);
  const hours = originalIssueEntry.estimated_hours;
  if (hours != estimated_hours) {
    updates.estimated_hours = estimated_hours;
  }
  const due_date = changes.due_date || null;
  if (originalIssueEntry.due_date !== due_date) {
    updates.due_date = due_date;
  }
  const { progress } = changes;
  if (originalIssueEntry.done_ratio !== progress) {
    updates.done_ratio = progress;
  }
  const { status } = changes;
  if (status != null && originalIssueEntry.status != null && originalIssueEntry.status.id !== status.value) {
    updates.status_id = status.value;
  }
  const { priority } = changes;
  if (priority != null && originalIssueEntry.priority != null && originalIssueEntry.priority.id !== priority.value) {
    updates.priority_id = priority.value;
  }
  const { assigned_to } = changes;
  if (originalIssueEntry.assigned_to && assigned_to && originalIssueEntry.assigned_to.id !== assigned_to.value) {
    updates.assigned_to_id = assigned_to ? assigned_to.value : '';
  } else if (assigned_to !== originalIssueEntry.assigned_to) {
    updates.assigned_to_id = assigned_to ? assigned_to.value : '';
  }

  const { description } = changes;
  if (originalIssueEntry.description !== description) {
    updates.description = description;
  }
  const { customFieldsMap } = changes;
  if (customFieldsMap != null && originalIssueEntry.custom_fields != null) {
    const customFieldsChanges = originalIssueEntry.custom_fields.map(({
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
  updates.id = originalIssueEntry.id;

  return request({
    url: `/issues/${originalIssueEntry.id}.json`,
    method: 'PUT',
    data: {
      issue: updates
    },
  }).then(() => {
    const updatedIssueEntry = {
      ...originalIssueEntry,
      ...updates
    };
    return dispatch(notify.ok(ISSUE_UPDATE, updatedIssueEntry));
  })
    .catch((error) => {
      console.error('Error when updating the issue', error);
      dispatch(notify.nok(ISSUE_UPDATE, error));
    });
};

const reset = () => ({ type: ISSUE_RESET });

export default {
  validateBeforeUpdate,
  update,
  reset,
};
