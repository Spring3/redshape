// eslint-disable-next-line
const { remote } = require('electron');
const pick = require('lodash/pick');

let config;

// main process
const mainProcess = process && process.type !== 'renderer' ? process : remote.process;

if (!config) {
  config = pick(mainProcess.env, 'PORT', 'ENCRYPTION_KEY', 'NODE_ENV');
  config.platform = mainProcess.platform;
}

module.exports = config;
