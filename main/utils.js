const path = require('path');

module.exports = {
  fixIcon: (windowConfig) => {
    if (process.platform !== 'win32' && process.platform !== 'win64') {
      return {
        ...windowConfig,
        icon: path.join(__dirname, '../assets/icon.png')
      };
    }
    return windowConfig;
  }
};
