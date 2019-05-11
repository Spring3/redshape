const shell = {
  openExternal: () => {}
};

const remote = {
  shell,
  process: {
    platform: 'darwin'
  },
  require: (path) => {
    if (path === './modules/request') {
      return require('../modules/request'); // eslint-disable-line
    }
    return undefined;
  }
};

module.exports = {
  remote
};
