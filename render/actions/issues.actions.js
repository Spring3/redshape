import _ from 'lodash';
import moment from 'moment';

import request, { notify } from './helper';

export const ISSUES_COMMENTS_SEND = 'ISSUES_COMMENTS_SEND';
export const ISSUES_TIME_ENTRY_GET = 'ISSUES_TIME_ENTRY_GET';

const sendComments = (issueId, comments) => (dispatch, getState) => {
  const { user = {} } = getState();

  dispatch(notify.start(ISSUES_COMMENTS_SEND, { subject: 'comments' }));

  return request({
    url: `/issues/${issueId}.json`,
    data: {
      issue: {
        notes: comments
      }
    },
    method: 'PUT'
  }).then(() => dispatch(
    notify.ok(
      ISSUES_COMMENTS_SEND,
      {
        created_on: moment().toLocaleString(),
        details: [],
        id: Date.now(),
        notes: comments,
        private_notes: false,
        user: {
          id: user.id,
          name: user.name
        }
      },
      { subject: 'comments' }
    )
  ))
    .catch((error) => {
      // eslint-disable-next-line
      console.error(`Error when trying to assign the issue with id ${issueId}:`, error.message);
      dispatch(notify.nok(ISSUES_COMMENTS_SEND, error, { subject: 'comments' }));
    });
};

const getTimeEntriesPage = (issueId, projectId, pageNumber, batchSize) => (dispatch, getState) => {
  const { issues } = getState();
  const { page, limit } = issues.selected.spentTime;
  const batch = typeof batchSize === 'number' ? Math.abs(batchSize) : limit;
  const pageIndex = typeof pageNumber === 'number' && pageNumber >= 0 ? pageNumber : page;
  const offset = pageIndex * batch;
  const query = _({
    offset,
    limit: batch,
    project_id: projectId,
    issue_id: issueId
  }).pickBy().value();

  dispatch(notify.start(ISSUES_TIME_ENTRY_GET, { page: pageIndex }));

  return request({
    url: '/time_entries.json',
    query,
    id: `getIssueTimeEntries:${issueId}:${pageIndex}`
  }).then(({ data }) => dispatch(notify.ok(ISSUES_TIME_ENTRY_GET, data, { page: pageIndex })))
    .catch((error) => {
      // eslint-disable-next-line
      console.error('Error when trying to get the list of time entries', error);
      dispatch(notify.nok(ISSUES_TIME_ENTRY_GET, error, { page: pageIndex }));
    });
};

export default {
  getTimeEntriesPage,
  sendComments,
};
