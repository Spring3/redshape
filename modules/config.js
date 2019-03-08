const storage = require('./storage');
const env = require('./env');

let config = { ...env };

if (storage.has('settings')) {
  config = { ...config, ...storage.get('settings') };
}

module.exports = config;
