const { remote } = require('electron');
const xss = require('xss');

const { shell } = remote;

const openExternalUrl = url => ((url && url.startsWith('http'))
  ? fetch(url, { method: 'HEAD' })
  : Promise.reject(new Error('Intercepted suspicious url', url))
).then(() => shell.openExternal(url))
  .catch(error => console.error('Error when opening external url', url, error.message));

const xssFilter = input => xss(input);

module.exports = {
  openExternalUrl,
  xssFilter
};
