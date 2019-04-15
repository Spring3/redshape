const { shell } = require('electron').remote;

const openExternalUrl = url => fetch(url, { method: 'HEAD' })
  .then(() => shell.openExternal(url))
  .catch(error => console.error('Error when opening external url', url, error.message));

module.exports = {
  openExternalUrl
};
