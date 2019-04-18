import axios, { CancelToken } from 'axios';

import storage from '../../modules/storage';

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

const TWENTY_SECONDS = 20000;
const pendingRequests = {};


const allowToBeCancelled = (headers, requestId) => {
  if (!requestId) {
    return headers;
  }

  if (pendingRequests[requestId]) {
    pendingRequests[requestId].cancel();
  }
  const source = CancelToken.source();
  const newHeaders = {
    ...headers,
    cancelToken: source.token
  };
  pendingRequests[requestId] = source;
  return newHeaders;
};

const commonAxiosConfig = {
  timeout: TWENTY_SECONDS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
  }
};

let axiosInstance;

if (storage.has('user')) {
  const axiosConfig = {
    timeout: commonAxiosConfig.timeout,
    headers: {
      ...commonAxiosConfig.headers
    }
  };
  const { api_key, redmineEndpoint } = storage.get('user');
  if (api_key) {
    axiosConfig.headers['X-Redmine-API-Key'] = api_key;
  }
  if (redmineEndpoint) {
    axiosConfig.baseURL = redmineEndpoint;
  }

  axiosInstance = axios.create(axiosConfig);
}

const handleReject = (e) => {
  // if this request was not cancelled
  if (!axios.isCancel(e)) {
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
    headers: allowToBeCancelled(headers || {}, id)
  };

  if (!['GET', 'DELETE'].includes(method)) {
    requestConfig.data = typeof data === 'string' ? data : JSON.stringify(data);
  }

  if (query) {
    requestConfig.params = query;
  }

  if (!axiosInstance) {
    return Promise.reject(new Error('401 - Unauthorized'));
  }

  return axiosInstance(requestConfig)
    .then(res => ({ data: res.data }))
    .catch(handleReject)
    .finally(() => delete pendingRequests[id]);
};

const reset = () => {
  axiosInstance = null;
};

const login = ({
  redmineEndpoint,
  url,
  headers = {}
}) => axios({
  timeout: commonAxiosConfig.timeout,
  headers: {
    ...commonAxiosConfig.headers,
    ...headers
  },
  url: `${redmineEndpoint}${url}`,
  method: 'GET'
}).then((res) => {
  const { api_key } = res.data.user || {};
  if (api_key) {
    reset();
    axiosInstance = axios.create({
      baseURL: redmineEndpoint,
      timeout: commonAxiosConfig.timeout,
      headers: {
        ...commonAxiosConfig.headers,
        'X-Redmine-API-Key': api_key
      }
    });
  }
  return { data: res.data };
});

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
  login,
  reset
};

export default request;
