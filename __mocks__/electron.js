import { name } from '../package.json';

const shell = {
  openExternal: () => {}
};

const remote = {
  shell,
  process: {
    platform: 'darwin'
  },
  app: {
    getName: () => name,
    isPackaged: false
  },
  require: (path) => {
    if (path.includes('/common/request')) {
      return require('../common/request'); // eslint-disable-line
    }
    return undefined;
  }
};

const ipcRenderer = {
  on: jest.fn(),
  send: jest.fn(),
};

module.exports = {
  remote,
  ipcRenderer,
};
