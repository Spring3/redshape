const Store = require('electron-store');
const { ENCRYPTION_KEY } = require('./env.js');

const store = new Store({ encryptionKey: ENCRYPTION_KEY });

module.exports = store;
