import * as axios from '../../modules/request';

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

const handleReject = (e) => {
  console.log('EEEE', e);
  // if this request was not cancelled
  if (!axios.default.isCancel(e)) {
    return Promise.reject(new Error(`Error ${e.status} (${e.statusText || e.message})`));
  }
  console.log('Request was cancelled');
  return undefined;
};

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
    headers: axios.makeCancellable(headers || {}, id)
  };

  if (!['GET', 'DELETE'].includes(method)) {
    requestConfig.data = typeof data === 'string' ? data : JSON.stringify(data);
  }

  if (query) {
    requestConfig.params = query;
  }

  if (!axios.getInstance()) {
    return Promise.reject(new Error('401 - Unauthorized'));
  }

  return axios.getInstance().request(requestConfig)
    .then((res) => {
      delete axios.pendingRequests[id];
      return ({ data: res.data });
    })
    .catch((error) => {
      delete axios.pendingRequests[id];
      return handleReject(error);
    });
};

const login = ({
  redmineEndpoint,
  url,
  headers
}) => {
  const defaultConfig = axios.getDefaultConfig();
  return axios.default.request({
    baseURL: redmineEndpoint,
    timeout: defaultConfig.timeout,
    headers: {
      ...defaultConfig.headers,
      ...(headers || {})
    },
    url,
    method: 'GET'
  }).then((res) => {
    axios.reset();
    const { api_key } = res.data.user || {};
    if (api_key) {
      axios.initialize(redmineEndpoint, api_key);
    }
    return { data: res.data };
  });
};

const notify = {
  start: (type, id) => ({ type, status: 'START', id }),
  paginate: (type, data, id) => ({ type, data, status: 'PAGE_NEXT', id }),
  ok: (type, data, id) => ({ type, data, status: 'OK', id }),
  nok: (type, data, id) => ({ type, data, status: 'NOK', id }),
  cancel: type => ({ type, status: 'CANCELLED' })
};

export {
  IssueFilter,
  notify,
  login
};

export default request;
