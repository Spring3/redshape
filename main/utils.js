const path = require('path');
const { shell } = require('electron');

const fixIcon = (windowConfig) => {
  if (process.platform === 'darwin') {
    return {
      ...windowConfig,
      icon: path.join(__dirname, '../assets/icon.png'),
      iconTray: path.join(__dirname, '../assets/icon-tray-macTemplate.png'),
      iconPause: path.join(__dirname, '../assets/icon-pause-tray-macTemplate.png'),
      iconPlay: path.join(__dirname, '../assets/icon-play-tray-macTemplate.png')
    };
  }
  if (process.platform === 'linux') {
    return {
      ...windowConfig,
      icon: path.join(__dirname, '../assets/icon.png'),
      iconTray: path.join(__dirname, '../assets/icon.png'),
      iconPause: path.join(__dirname, '../assets/icon-pause.png'),
      iconPlay: path.join(__dirname, '../assets/icon-play.png')
    };
  }
  return {
    ...windowConfig,
    icon: path.join(__dirname, '../assets/icon.png'),
    iconTray: path.join(__dirname, '../assets/icon.png'),
    iconPause: path.join(__dirname, '../assets/icon-pause.png'),
    iconPlay: path.join(__dirname, '../assets/icon-play.png')
  };
};

const openExternalUrl = (url) => new Promise((resolve, reject) => { // eslint-disable-line
  return (url && (url.startsWith('http') || url.startsWith('mailto:')))
    ? resolve(url)
    : reject(new Error('Intercepted suspicious url', url));
})
  .then((link) => shell.openExternal(link))
  // eslint-disable-next-line
  .catch((error) => console.error('Error when opening external url', url, error.message));

module.exports = {
  fixIcon,
  openExternalUrl
};
