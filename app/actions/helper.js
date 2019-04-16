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
    requestConfig.body = typeof data === 'string' ? data : JSON.stringify(data);
  }

  return fetch(url, requestConfig).then((res) => {
    if (res.ok) {
      return res.text()
        .then(text => (text ? JSON.parse(text) : text))
        .then(obj => ({ data: obj }));
    }
    return Promise.reject(new Error(`Error ${res.status} (${res.statusText})`));
  });
};

const notify = {
  start: (type, id) => ({ type, status: 'START', id }),
  paginate: (type, data, id) => ({ type, data, status: 'PAGE_NEXT', id }),
  ok: (type, data, id) => ({ type, data, status: 'OK', id }),
  nok: (type, data, id) => ({ type, data, status: 'NOK', id })
};

export {
  IssueFilter,
  notify
};

export default request;
