const { remote } = require('electron');
const _ = require('lodash');

let config;

// main process
const mainProcess = (process || remote.process);

if (!config) {
  config = _.pick(mainProcess.env, 'PORT', 'ENCRYPTION_KEY', 'NODE_ENV');
  config.platform = mainProcess.platform;
}

module.exports = config;
