const os = require('os');
const Store = require('electron-store');
const isDev = require('electron-is-dev');
const { ENCRYPTION_KEY } = require('./env');

const storage = new Store({
  name: isDev ? 'config-dev' : 'config',
  encryptionKey: ENCRYPTION_KEY
});

const api = {
  settings: {
    get: () => storage.get('settings', { os: os.platform }),
    isDefined: () => storage.has('settings'),
    set: (data) => storage.set('settings', data)
  },
  user: {
    get: () => storage.get('user'),
    isDefined: () => storage.has('user'),
    set: (data) => storage.set('user', data)
  }
};

// TODO: save os.platform into the storage on start

module.exports = api;
