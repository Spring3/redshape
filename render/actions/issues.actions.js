import _ from 'lodash';

import request, { notify } from './helper';

export const ISSUES_TIME_ENTRY_GET = 'ISSUES_TIME_ENTRY_GET';

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
};
