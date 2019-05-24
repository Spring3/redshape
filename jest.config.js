module.exports = {
  name: 'redshape',
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  setupFilesAfterEnv: ['./setupJest.js'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/style-mock.js'
  }
};
