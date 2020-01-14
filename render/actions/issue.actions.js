import Joi from '@hapi/joi';
import request, { notify } from './helper';

export const ISSUE_UPDATE = 'ISSUE_UPDATE';
export const ISSUE_RESET = 'ISSUE_RESET';
export const ISSUE_UPDATE_VALIDATION_FAILED = 'ISSUE_UPDATE_VALIDATION_FAILED';
export const ISSUE_UPDATE_VALIDATION_PASSED = 'ISSUE_UPDATE_VALIDATION_PASSED';

const validateBeforeCommon = (issueEntry) => {
  const schema = {
    progress: Joi.number().integer().min(0).max(100).allow(''), // done_ratio
  };

  const validationSchema = Joi.object().keys(schema).unknown().required();
  const validationResult = validationSchema.validate(issueEntry);
  return validationResult;
}

const validateBeforeUpdate = (issueEntry) => {
  const validationResult = validateBeforeCommon(issueEntry);
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

  const updates = {
  };

  if (changes.progress) {
    updates.done_ratio = changes.progress;
  }

  const updatedIssueEntry = {
    ...originalIssueEntry,
  };
  let progress = changes.progress;
  if (progress != null){
    progress = progress >= 0 ? Number(progress) : '';
    updatedIssueEntry.done_ratio = progress;
  }

  return request({
    url: `/issues/${originalIssueEntry.id}.json`,
    method: 'PUT',
    data: {
      issue: updates
    },
  }).then(() => {
    const updatedIssueEntry = {
      ...originalIssueEntry,
    };
    if (changes.progress) {
      updatedIssueEntry.done_ratio = progress;
    }
    return dispatch(notify.ok(ISSUE_UPDATE, updatedIssueEntry));
  })
    .catch((error) => {
      console.error('Error when updating the issue', error);
      dispatch(notify.nok(ISSUE_UPDATE, error));
    });
}

const reset = () => ({ type: ISSUE_RESET });

export default {
  validateBeforeUpdate,
  update,
  reset,
};
