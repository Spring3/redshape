import request, { notify } from './helper';

export const ISSUE_UPDATE = 'ISSUE_UPDATE';

const update = (originalIssueEntry, changes) => (dispatch) => {
  const validateAction = validateBeforeUpdate(changes);
  dispatch(validateAction);

  if (validateAction.type === ISSUE_UPDATE_VALIDATION_FAILED) {
    return Promise.resolve();
  }

  const updates = {};

  // const estimated_hours = durationToHours(changes.estimated_duration);
  const hours = originalIssueEntry.estimated_hours;
  // if (hours !== estimated_hours) {
  //   updates.estimated_hours = estimated_hours;
  // }
  const due_date = changes.due_date || null;
  if (originalIssueEntry.due_date !== due_date) {
    updates.due_date = due_date;
  }
  const { progress } = changes;
  if (originalIssueEntry.done_ratio !== progress) {
    updates.done_ratio = progress;
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
      // eslint-disable-next-line
      console.error('Error when updating the issue', error);
      dispatch(notify.nok(ISSUE_UPDATE, error));
    });
};

export default {
  update
};
