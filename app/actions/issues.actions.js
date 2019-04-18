import moment from 'moment';
import request, { notify } from './helper';

export const ISSUES_GET_ALL = 'ISSUES_GET_ALL';
export const ISSUES_GET = 'ISSUES_GET';
export const ISSUES_UPDATE = 'ISSUES_UPDATE';
export const ISSUES_COMMENT_SEND = 'ISSUES_COMMENT_SEND';
export const ISSUES_STATUSES_GET_ALL = 'ISSUES_STATUSES_GET_ALL';
export const ISSUES_TRACKERS_GET_ALL = 'ISSUES_TRACKERS_GET_ALL';

const getAll = (filter, offset, limit) => (dispatch) => {
  let url = '/issues.json?include=attachments,children,relations,journals';

  if (filter) {
    url += filter;
  }

  if (offset) {
    url += `&offset=${offset}`;
  }

  if (limit) {
    url += `&limit=${limit}`;
  }

  dispatch(notify.start(ISSUES_GET_ALL));

  return request({ url, id: 'getAllIssues' })
    .then(({ data }) => dispatch(notify.ok(ISSUES_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get a list of issues:', error.message);
      dispatch(notify.nok(ISSUES_GET_ALL, error));
    });
};

const get = id => (dispatch) => {
  dispatch(notify.start(ISSUES_GET));

  return request({
    url: `/issues/${id}.json?include=attachments,children,relations,journals`,
    id: `getIssueDetails:${id}`
  }).then(({ data }) => dispatch(notify.ok(ISSUES_GET, data)))
    .catch((error) => {
      console.error(`Error when trying to get the issue with id ${id}:`, error.message);
      dispatch(notify.nok(ISSUES_GET, error));
    });
};

const sendComments = (issueId, comments) => (dispatch, getState) => {
  const { user = {} } = getState();
  const actionId = 'comments';

  dispatch(notify.start(ISSUES_COMMENT_SEND, actionId));

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
      ISSUES_COMMENT_SEND,
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
      actionId
    )
  ))
    .catch((error) => {
      console.error(`Error when trying to assign the issue with id ${issueId}:`, error.message);
      dispatch(notify.nok(ISSUES_COMMENT_SEND, error, actionId));
    });
};

const getAllStatuses = () => (dispatch) => {
  dispatch(notify.start(ISSUES_STATUSES_GET_ALL));

  return request({
    url: '/issue_statuses.json',
    id: 'getAllIssueStatuses'
  }).then(({ data }) => dispatch(notify.ok(ISSUES_STATUSES_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get the list of issue statuses:', error.message);
      dispatch(notify.nok(ISSUES_STATUSES_GET_ALL, error));
    });
};

const getAllTrackers = (dispatch) => {
  dispatch(notify.start(ISSUES_TRACKERS_GET_ALL));

  return request({
    url: '/trackers.json',
    id: 'getAllIssueTrackers'
  }).then(({ data }) => dispatch(notify.ok(ISSUES_TRACKERS_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get the list of issue trackers:', error.message);
      dispatch(notify.nok(ISSUES_TRACKERS_GET_ALL, error));
    });
};

export default {
  getAll,
  get,
  sendComments,
  getAllStatuses,
  getAllTrackers
};
