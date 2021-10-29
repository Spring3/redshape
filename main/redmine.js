const got = require('got');
const { transform } = require('./transformers/index');

const createRequestClient = (config = {}) => {
  let isInitialized = false;
  let instance;

  const initialize = (config) => {
    isInitialized = Boolean(config.endpoint && config.token);
    instance = got.extend({
      prefixUrl: config.endpoint,
      headers: { 'X-Redmine-API-Key': config.token },
      responseType: 'json'
    });
  };

  const handleUnsuccessfulRequest = (error) => ({
    success: false,
    error
  });

  const send = async (data) => {
    if (!instance && !data.headers?.Authorization) {
      throw new Error('Http client is not initialized.');
    }

    try {
      const response = await instance(data.route, {
        method: data.method || 'GET',
        headers: data.headers,
        json: data.body
      });

      console.log(response.statusCode, response.body);

      if (response.statusCode === 200) {
        if (!isInitialized && data.route === 'users/current.json' && response.body.user?.api_key) {
          initialize({ endpoint: config.endpoint, token: response.body.user?.api_key });
        }

        return {
          data: transform(data.route, response.body),
          success: true,
        };
      }

      return handleUnsuccessfulRequest(response.body);
    } catch (error) {
      return handleUnsuccessfulRequest(error);
    }
  };

  initialize(config);

  return {
    initialize,
    isInitialized: () => isInitialized,
    send
  };
};

const redmineClient = createRequestClient();

module.exports = {
  redmineClient
};
