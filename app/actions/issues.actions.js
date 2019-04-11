import moment from 'moment';
import request, { notify } from './helper';

export const ISSUES_GET_ALL = 'ISSUES_GET_ALL';
export const ISSUES_GET = 'ISSUES_GET';
export const ISSUES_UPDATE = 'ISSUES_UPDATE';
export const ISSUES_ASSIGN = 'ISSUES_ASSIGN';
export const ISSUES_COMMENT_SEND = 'ISSUES_COMMENT_SEND';
export const ISSUES_STATUSES_GET_ALL = 'ISSUES_STATUSES_GET_ALL';
export const ISSUES_TRACKERS_GET_ALL = 'ISSUES_TRACKERS_GET_ALL';

const getAll = (filter, offset, limit) => (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;

  let url = `${redmineEndpoint}/issues.json?include=attachments,children,relations,journals`;

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

  return request({
    url,
    token: api_key  
  }).then(({ data }) => dispatch(notify.ok(ISSUES_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get a list of issues:', error.message);
      dispatch(notify.nok(ISSUES_GET_ALL, error));
    });
};

const get = id => (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;

  dispatch(notify.start(ISSUES_GET));

  return request({
    url: `${redmineEndpoint}/issues/${id}.json?include=attachments,children,relations,journals`,
    token: api_key,
  }).then(({ data }) => dispatch(notify.ok(ISSUES_GET, data)))
    .catch((error) => {
      console.error(`Error when trying to get the issue with id ${id}:`, error.message);
      dispatch(notify.nok(ISSUES_GET, error));
    });
};

const sendComments = (issueId, comments) => (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;

  const actionId = 'comments';

  dispatch(notify.start(ISSUES_COMMENT_SEND, actionId));

  return request({
    url: `${redmineEndpoint}/issues/${issueId}.json`,
    data: {
      issue: {
        notes: comments
      }
    },
    method: 'PUT',
    token: api_key,
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

const assign = (issueId, assignee) => (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;

  const actionId = 'assignee';

  dispatch(notify.start(ISSUES_ASSIGN, actionId));

  return request({
    url: `${redmineEndpoint}/issues/${issueId}.json`,
    data: {
      issue: {
        assigned_to_id: assignee
      }
    },
    method: 'PUT',
    token: api_key,
  }).then(({ data }) => dispatch(notify.ok(ISSUES_ASSIGN, data, actionId)))
    .catch((error) => {
      console.error(`Error when trying to assign the issue with id ${issueId}:`, error.message);
      dispatch(notify.nok(ISSUES_ASSIGN, error, actionId));
    });
};

const getAllStatuses = () => (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;

  dispatch(notify.start(ISSUES_STATUSES_GET_ALL));

  return request({
    url: `${redmineEndpoint}/issue_statuses.json`,
    token: api_key
  }).then(({ data }) => dispatch(notify.ok(ISSUES_STATUSES_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get the list of issue statuses:', error.message);
      dispatch(notify.nok(ISSUES_STATUSES_GET_ALL, error));
    });
};

const getAllTrackers = (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;

  dispatch(notify.start(ISSUES_TRACKERS_GET_ALL));

  return request({
    url: `${redmineEndpoint}/trackers.json'`,
    token: api_key
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
  assign,
  getAllStatuses,
  getAllTrackers
};
