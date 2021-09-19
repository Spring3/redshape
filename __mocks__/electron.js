import { name } from '../package.json';

const shell = {
  openExternal: () => {},
};

const powerMonitor = {
  getSystemIdleTime: jest.fn(),
};

const remote = {
  shell,
  process: {
    platform: 'darwin',
  },
  app: {
    getName: () => name,
    isPackaged: false,
  },
  require: (path) => {
    if (path.includes('/common/request')) {
      return require("../common/request"); // eslint-disable-line
    }
    if (path.includes('electron')) {
      return { powerMonitor };
    }
    return undefined;
  },
};

const ipcRenderer = {
  on: jest.fn(),
  send: jest.fn(),
  removeListener: jest.fn(),
};

export default {
  require: jest.fn().mockReturnThis({ remote, require: global.require }),
  match: jest.fn(),
  app: jest.fn(),
  dialog: jest.fn(),
  remote,
  ipcRenderer,
};

module.exports = {
  require: jest.fn().mockReturnThis({ remote, require: global.require }),
  match: jest.fn(),
  app: jest.fn(),
  dialog: jest.fn(),
  remote,
  ipcRenderer,
};
