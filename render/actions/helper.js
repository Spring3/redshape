const axios = require('electron').remote.require('../common/request');

function IssueFilter () {
  const filter = {};

  this.issue = (ids) => {
    filter.issue_id = Array.isArray(ids) ? ids.join(',') : ids;
    return this;
  };

  this.project = (id) => {
    filter.project_id = id;
    return this;
  };

  this.subproject = (id) => {
    filter.subprojectId = id;
    return this;
  };

  this.tracker = (id) => {
    filter.tracker_id = id;
    return this;
  };

  this.status = ({ open, closed }) => {
    if (open && closed) {
      filter.status_id = '*';
    } else {
      filter.status_id = open ? 'open' : 'closed';
    }
    return this;
  };

  this.assignee = (id) => {
    filter.assigned_to_id = id;
    return this;
  };

  this.author = (id) => {
    filter.author_id = id;
    return this;
  };

  this.title = (str) => {
    if (str) {
      filter.subject = encodeURIComponent(`~${str.trim()}`);
    }
    return this;
  };

  this.due = (date) => {
    filter.due_date = date.toISOString();
    return this;
  };

  this.createdAt = (date) => {
    filter.created_on = date.toISOString();
    return this;
  };

  this.createdBetween = (startDate, endDate) => {
    filter.created_on = encodeURIComponent(`><${startDate.toISOString()}|${endDate.toISOString()}`);
    return this;
  };

  this.priority = (id) => {
    filter.priority_id = id;
    return this;
  };

  this.sort = (by, direction) => {
    if (by && direction) {
      const column = by.indexOf('.') !== -1
        ? by.substring(0, by.indexOf('.'))
        : by;
      filter.sort = `${column}:${direction}`;
    }
    return this;
  };

  this.build = () => ({ ...filter });
}

const request = ({
  url,
  method = 'GET',
  data,
  headers,
  query,
  id
}) => {
  const requestConfig = {
    url,
    method,
    headers,
    id
  };

  if (!['GET', 'DELETE'].includes(method)) {
    requestConfig.data = typeof data === 'string' ? data : JSON.stringify(data);
  }

  if (query) {
    requestConfig.params = query;
  }

  return axios.authorizedRequest(requestConfig);
};

const login = ({
  redmineEndpoint,
  url,
  headers
}) => axios.request({
  baseURL: redmineEndpoint,
  timeout: 20000,
  headers: headers || {},
  url,
  method: 'GET'
}).then((res) => {
  const { api_key } = res.data.user || {};
  if (api_key) {
    axios.initialize(redmineEndpoint, api_key);
  }
  return { data: res.data };
});

const logout = () => axios.reset();

const notify = {
  start: (type, info = {}) => ({ type, status: 'START', info }),
  ok: (type, data, info = {}) => ({ type, data, status: 'OK', info }),
  nok: (type, data, info = {}) => ({ type, data, status: 'NOK', info }),
  cancel: (type, info = {}) => ({ type, status: 'CANCELLED', info })
};

export {
  IssueFilter,
  notify,
  login,
  logout
};

export default request;
