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
    filter.subject = encodeURIComponent(`~${str}`);
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

  this.build = () => {
    let str = '';
    for (const [key, value] of Object.entries(filter)) { // eslint-disable-line
      str += `&${key}=${value}`;
    }
    return str;
  };
}

const request = ({
  url,
  method = 'GET',
  data,
  requestHeaders = {},
  token,
}) => {
  const requestConfig = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      ...requestHeaders
    },
  };

  if (token) {
    requestConfig.headers['X-Redmine-API-Key'] = token;
  }

  if (!['GET', 'DELETE'].includes(method)) {
    requestConfig.body = data;
  }

  return fetch(url, requestConfig).then((res) => {
    if (res.ok) {
      return res.json().then(obj => ({ data: obj }));
    }
    return Promise.reject(new Error(`Error ${res.status} (${res.statusText})`));
  });
};

const notify = {
  start: type => ({ type, status: 'START' }),
  ok: (type, data) => ({ type, data, status: 'OK' }),
  nok: (type, data) => ({ type, data, status: 'NOK' })
};

export {
  IssueFilter,
  notify
};

export default request;
