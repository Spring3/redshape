import Joi from '@hapi/joi';
import moment from 'moment';
import { Issue } from '../types';
import { durationToHours } from './datetime';

const validateIssue = ({ issue, checkFields }: { issue: Issue, checkFields: string[] }) => {
  let schema: Record<string, any> = {};

  const schemaFields: Record<string, Joi.Schema> = {
    progress: Joi.number()
      .integer()
      .min(0)
      .max(100)
      .allow(''), // done_ratio
    estimatedDuration: Joi.string()
      .custom(validateEstimatedDuration, 'estimated duration validator')
      .allow(''),
    dueDate: Joi.string()
      .custom(validateDate, 'due date validation')
      .allow(null, '')
  };

  if (checkFields) {
    for (const checkField of checkFields) {
      schema[checkField] = schemaFields[checkField];
    }
  } else {
    schema = schemaFields;
  }

  const validationSchema = Joi.object()
    .keys(schema)
    .unknown()
    .required();
  const validationResult = validationSchema.validate(issue);
  return validationResult;
};

const validateEstimatedDuration = (value: string, helpers: any) => {
  const hours = durationToHours(value);
  if (hours == null) {
    return helpers.message(`
      "estimation" requires a value in hours, a duration string (eg. 34m, 1 day 5m) or an empty string
    `);
  }
  if (hours <= 0) {
    return helpers.message(`"estimation" requires a positive duration (${hours} hours)`);
  }
  return hours;
};

const validateDate = (value: string, helpers: any) => {
  const validDate = moment(value).isValid();
  if (validDate || value === '') {
    return value;
  }
  return helpers.message('"due_date" requires a valid date or an empty string');
};

export {
  validateDate,
  validateEstimatedDuration,
  validateIssue
};
