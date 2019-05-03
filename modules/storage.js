const Store = require('electron-store');
const { ENCRYPTION_KEY } = require('./env.js');

const storage = new Store({ encryptionKey: ENCRYPTION_KEY });

module.exports = storage;
