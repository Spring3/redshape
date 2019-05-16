module.exports = {
  name: 'redtime',
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  setupFilesAfterEnv: ['./setupJest.js'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/style-mock.js'
  }
};
