const { remote } = require('electron');
const _pick = require('lodash/pick');

let config;

// main process
const mainProcess = (process || remote.process);

if (!config) {
  config = _pick(mainProcess.env, 'PORT', 'ENCRYPTION_KEY', 'NODE_ENV');
  config.platform = mainProcess.platform;
}

module.exports = config;
