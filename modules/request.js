import axios, { CancelToken } from 'axios';

import storage from './storage';

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
  const source = CancelToken.source();
  const newHeaders = {
    ...headers,
    cancelToken: source.token
  };
  pendingRequests[requestId] = source;
  return newHeaders;
};

const getDefaultConfig = () => ({
  timeout: TWENTY_SECONDS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
  }
});

const initialize = (redmineEndpoint, token) => {
  if (!redmineEndpoint || !token) {
    return;
  }
  const defaultConfig = getDefaultConfig();
  const axiosConfig = {
    baseURL: redmineEndpoint,
    timeout: defaultConfig.timeout,
    headers: {
      ...defaultConfig.headers,
      'X-Redmine-API-Key': token
    }
  };
  instance = axios.create(axiosConfig);
};

const getInstance = () => instance;
const reset = () => { instance = null; };

if (storage.has('user')) {
  const { api_key, redmineEndpoint } = storage.get('user');
  if (api_key && redmineEndpoint) {
    initialize(redmineEndpoint, api_key);
  }
}

export {
  getDefaultConfig,
  makeCancellable,
  initialize,
  getInstance,
  pendingRequests,
  reset
};

export default axios;
