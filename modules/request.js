const axios = require('axios');
const storage = require('./storage');

let instance;

const TWENTY_SECONDS = 20000;

const pendingRequests = {};

const makeCancellable = (headers, requestId) => {
  if (!requestId) {
    return headers;
  }

  if (pendingRequests[requestId]) {
    pendingRequests[requestId].cancel();
  }
  const source = axios.CancelToken.source();
  const newHeaders = {
    ...headers,
    cancelToken: source.token
  };
  pendingRequests[requestId] = source;
  return newHeaders;
};

const initialize = (redmineEndpoint, token) => {
  if (!redmineEndpoint || !token) {
    return;
  }
  const axiosConfig = {
    baseURL: redmineEndpoint,
    timeout: TWENTY_SECONDS,
    headers: {
      'X-Redmine-API-Key': token
    }
  };
  instance = axios.create(axiosConfig);
};

const getInstance = () => instance;

const reset = () => { instance = undefined; };

if (storage.has('user')) {
  const { api_key, redmineEndpoint } = storage.get('user');
  if (api_key && redmineEndpoint) {
    initialize(redmineEndpoint, api_key);
  }
}

const handleReject = (error) => {
  // if this request was not cancelled
  if (!axios.isCancel(error)) {
    let errorMessage = 'Error';
    if (error.status) {
      errorMessage = `${errorMessage} ${error.status}`;
    }
    errorMessage = `${errorMessage} (${error.statusText || error.message})`;

    return Promise.reject(new Error(errorMessage));
  }
  return undefined;
};

const authorizedRequest = (config) => {
  if (config.id) {
    Object.assign(
      config,
      { headers: makeCancellable(config.headers || {}, config.id) }
    );
  }
  if (!instance) {
    return Promise.reject(new Error('401 - Unauthorized'));
  }

  Object.assign(
    config,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'X-Redmine-API-Key': instance.defaults.headers['X-Redmine-API-Key'],
        ...config.headers
      }
    }
  );

  return getInstance().request(config)
    .then((res) => {
      delete pendingRequests[config.id];
      return ({ data: res.data });
    })
    .catch((error) => {
      delete pendingRequests[config.id];
      return handleReject(error);
    });
};

const request = (config) => {
  Object.assign(config, {
    timeout: TWENTY_SECONDS,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      ...config.headers
    }
  });
  return axios.request(config).catch(handleReject);
};

module.exports = {
  default: axios,
  makeCancellable,
  initialize,
  getInstance,
  pendingRequests,
  reset,
  authorizedRequest,
  request
};
