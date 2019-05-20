const xss = require('xss');
const { shell } = require('electron').remote;
const axios = require('./request');


const openExternalUrl = url => ((url && url.startsWith('http'))
  ? Promise.resolve()
  : Promise.reject(new Error('Intercepted suspicious url', url))
).then(() => shell.openExternal(url))
  .catch(error => console.error('Error when opening external url', url, error.message));

const xssFilter = input => xss(input);

module.exports = {
  openExternalUrl,
  xssFilter
};
