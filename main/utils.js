const path = require('path');

module.exports = {
  fixIcon: (windowConfig) => {
    if (process.platform === 'darwin') {
      return {
        ...windowConfig,
        icon: path.join(__dirname, '../assets/icon.icns')
      };
    }
    if (process.platform === 'linux') {
      return {
        ...windowConfig,
        icon: path.join(__dirname, '../assets/icon.png')
      };
    }
    return windowConfig;
  }
};
