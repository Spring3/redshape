const path = require('path');

module.exports = {
  fixIcon: (windowConfig) => {
    if (process.platform === 'darwin') {
      return {
        ...windowConfig,
        icon: path.join(__dirname, '../assets/icon.icns'),
        // TODO: pn2icns gives black background
        // To be done by someone who has this platform
        iconPause: path.join(__dirname, '../assets/icon.icns'),
        iconPlay: path.join(__dirname, '../assets/icon.icns')
      };
    }
    if (process.platform === 'linux') {
      return {
        ...windowConfig,
        icon: path.join(__dirname, '../assets/icon.png'),
        iconPause: path.join(__dirname, '../assets/icon-pause.png'),
        iconPlay: path.join(__dirname, '../assets/icon-play.png')
      };
    }
    return {
      ...windowConfig,
      icon: path.join(__dirname, '../assets/icon.ico'),
      iconPause: path.join(__dirname, '../assets/icon-pause.ico'),
      iconPlay: path.join(__dirname, '../assets/icon-play.ico')
    };
  }
};
