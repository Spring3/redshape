const axios = require('axios');

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

const handleReject = (error) => {
  // if this request was not cancelled
  if (!axios.isCancel(error)) {
    let errorMessage = 'Error';
    const { response } = error;
    const data = response && response.data;
    const errors = data && data.errors;
    if (errors) {
      if (errors.length > 1) {
        errorMessage = `${errorMessage}s - ${errors.join(' - ')}`;
      } else {
        errorMessage = `${errorMessage} ${errors[0]}`;
      }
    } else if (error.status) {
      errorMessage = `${errorMessage} ${error.status}`;
    }
    errorMessage = `${errorMessage} (${error.statusText || error.message})`;

    const err = new Error(errorMessage);
    return Promise.reject(err);
  }
  return undefined;
};

const authorizedRequest = (config = {}) => {
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
        'X-Redmine-API-Key': instance.defaults.headers['X-Redmine-API-Key'],
        ...(config.headers || {})
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

const request = (config = {}) => {
  Object.assign(config, {
    timeout: TWENTY_SECONDS,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(config.headers || {})
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
