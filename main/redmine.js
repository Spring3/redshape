const got = require('got');
const { transform } = require('./transformers/index');

const createRequestClient = () => {
  let instance;
  let isInitialized;

  const handleUnsuccessfulRequest = (error) => ({
    success: false,
    error
  });

  const initialize = async (data) => {
    if (isInitialized) {
      reset();
    }

    const route = 'users/current.json';

    const configuration = data.token
      ? {
        prefixUrl: data.endpoint,
        headers: { 'X-Redmine-API-Key': data.token },
        responseType: 'json'
      }
      : {
        prefixUrl: data.endpoint,
        headers: {
          Authorization: data.headers.Authorization
        },
        responseType: 'json'
      };

    try {
      const response = await got(route, {
        method: 'GET',
        ...configuration
      });

      console.log(response.statusCode, response.body);

      const loginSuccess = [204, 200].includes(response.statusCode);
      isInitialized = loginSuccess;

      if (loginSuccess) {
        const payload = transform(route, response.body);

        instance = got.extend({
          ...configuration,
          headers: {
            'X-Redmine-API-Key': payload.token
          }
        });

        return {
          success: true,
          payload
        };
      }

      return handleUnsuccessfulRequest(response.body);
    } catch (error) {
      return handleUnsuccessfulRequest(error);
    }
  };

  const reset = () => {
    isInitialized = false;
    instance = undefined;
  };

  const send = async (data) => {
    if (!isInitialized) {
      throw new Error('Http client is not initialized.');
    }

    try {
      const response = await instance(data.route, {
        method: data.method || 'GET',
        headers: data.headers,
        json: data.body,
        searchParams: data.query
      });

      console.log(response.statusCode, response.body);

      if (response.statusCode === 200) {
        return {
          payload: transform(data.route, response.body),
          success: true,
        };
      }

      return handleUnsuccessfulRequest(response.body);
    } catch (error) {
      return handleUnsuccessfulRequest(error);
    }
  };

  return {
    initialize,
    isInitialized: () => isInitialized,
    send,
    reset
  };
};

const redmineClient = createRequestClient();

module.exports = {
  redmineClient
};
