const standardEnv = {
  PORT: process.env.PORT,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  NODE_ENV: process.env.NODE_ENV
};

describe('ENV', () => {
  beforeEach(() => {
    Object.assign(process.env, {
      PORT: 1234,
      ENCRYPTION_KEY: 'test-key',
      NODE_ENV: 'test'
    });
  });

  afterAll(() => Object.assign(process.env, standardEnv));

  it('should get the default env data', () => {
    const env = require('../../modules/env.js'); // eslint-disable-line
    expect(env).toEqual({
      PORT: '1234',
      ENCRYPTION_KEY: 'test-key',
      NODE_ENV: 'test',
      platform: process.platform
    });
  });
});
