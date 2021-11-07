const Store = require('electron-store');

const standardEnv = {
  PORT: process.env.PORT,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  NODE_ENV: process.env.NODE_ENV
};

describe('Config', () => {
  beforeAll(() => {
    Store.__initialize({
      settings: {
        PORT: '2222'
      }
    });
  });

  beforeEach(() => {
    Object.assign(process.env, {
      PORT: 1234,
      ENCRYPTION_KEY: 'test-key',
      NODE_ENV: 'test'
    });
  });

  afterAll(() => {
    Object.assign(process.env, standardEnv);
    Store.__reset();
  });

  it('overwrite default env data with user settings', () => {
    const config = require('../../common/config.js'); // eslint-disable-line

    expect(config).toEqual({
      PORT: '2222',
      ENCRYPTION_KEY: 'test-key',
      NODE_ENV: 'test',
      platform: process.platform
    });
  });
});
