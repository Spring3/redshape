const xss = require('xss');
// eslint-disable-next-line import/no-extraneous-dependencies
const { shell } = require('electron').remote;

const openExternalUrl = url => new Promise((resolve, reject) => { // eslint-disable-line
  return (url && (url.startsWith('http') || url.startsWith('mailto:')))
    ? resolve(url)
    : reject(new Error('Intercepted suspicious url', url));
})
  .then((link) => shell.openExternal(link))
  // eslint-disable-next-line
  .catch((error) => console.error('Error when opening external url', url, error.message));

const xssFilter = (input) => xss(input);

module.exports = {
  openExternalUrl,
  xssFilter
};
