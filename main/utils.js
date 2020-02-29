const path = require('path');

module.exports = {
  fixIcon: (windowConfig) => {
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
  }
};
