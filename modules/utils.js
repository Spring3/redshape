const { remote } = require('electron');
const xss = require('xss');
const axios = require('./request');

const { shell } = remote;

const openExternalUrl = url => ((url && url.startsWith('http'))
  ? axios.default.head(url)
  : Promise.reject(new Error('Intercepted suspicious url', url))
).then(() => shell.openExternal(url))
  .catch(error => console.error('Error when opening external url', url, error.message));

const xssFilter = input => xss(input);

module.exports = {
  openExternalUrl,
  xssFilter
};
