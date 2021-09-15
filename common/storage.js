const Store = require('electron-store');
const isDev = require('electron-is-dev');
const { ENCRYPTION_KEY } = require('./env');

const storage = new Store({
  name: isDev ? 'config-dev' : 'config',
  encryptionKey: ENCRYPTION_KEY
});

module.exports = storage;
