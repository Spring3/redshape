import request, { notify } from './helper';

export const ISSUES_GET_ALL = 'ISSUES_GET_ALL';
export const ISSUES_GET = 'ISSUES_GET';
export const ISSUES_UPDATE = 'ISSUES_UPDATE';
export const ISSUES_ASSIGN = 'ISSUES_ASSIGN';
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
      console.error('Error when trying to get a list of issues', error);
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
      console.error(`Error when trying to get the issue with id ${id}`, error);
      dispatch(notify.nok(ISSUES_GET, error));
    });
};

const assign = (issueId, assignee, comment) => (dispatch, getState) => {
  const { user = {} } = getState();
  const { redmineEndpoint, api_key } = user;

  dispatch(notify.start(ISSUES_ASSIGN));

  return request({
    url: `${redmineEndpoint}/issues/${issueId}.json`,
    data: { notes: comment, assigned_to_id: assignee},
    method: 'PUT',
    token: api_key,
  }).then(({ data }) => dispatch(notify.ok(ISSUES_ASSIGN, data)))
    .catch((error) => {
      console.error(`Error when trying to assign the issue with id ${issueId}`, error);
      dispatch(notify.nok(ISSUES_ASSIGN, error));
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
      console.error('Error when trying to get the list of issue statuses', error);
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
      console.error('Error when trying to get the list of issue trackers', error);
      dispatch(notify.nok(ISSUES_TRACKERS_GET_ALL, error));
    });
};

export default {
  getAll,
  get,
  assign,
  getAllStatuses,
  getAllTrackers
};
