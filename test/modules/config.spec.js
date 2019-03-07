const mockHas = jest.fn();
const mockGet = jest.fn();

jest.mock('electron-store', () => {
  function Store({ encryptionKey }) {
    this.encryptionKey = encryptionKey;
    this.values = {
      settings: {
        PORT: '2222'
      }
    };

    this.get = (key) => {
      mockGet(key);
      return this.values[key];
    };
    this.has = (key) => {
      mockHas(key);
      return Object.hasOwnProperty.call(this.values, key);
    };
  }
  return Store;
});

const standardEnv = {
  PORT: process.env.PORT,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  NODE_ENV: process.env.NODE_ENV
};

describe('Config', () => {
  beforeEach(() => {
    Object.assign(process.env, {
      PORT: 1234,
      ENCRYPTION_KEY: 'test-key',
      NODE_ENV: 'test'
    });
  });

  afterAll(() => Object.assign(process.env, standardEnv));

  it('overwrite default env data with user settings', () => {
    const config = require('../../modules/config.js'); // eslint-disable-line
    expect(config).toEqual({
      PORT: '2222',
      ENCRYPTION_KEY: 'test-key',
      NODE_ENV: 'test'
    });
    expect(mockHas).toHaveBeenCalledWith('settings');
    expect(mockGet).toHaveBeenCalledWith('settings');
  });
});
