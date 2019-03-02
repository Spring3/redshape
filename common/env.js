const { remote } = require('electron');
const _ = require('lodash');

let config;

// main process
const { env } = (process || remote.process);

if (!config) {
  config = _.pick(env, 'PORT', 'ENCRYPTION_KEY', 'NODE_ENV');
}

module.exports = config;
