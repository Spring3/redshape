module.exports = {
  name: 'redshape',
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  setupFilesAfterEnv: ['./setupJest.js'],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/style-mock.js',
    '\\.(png)$': '<rootDir>/__mocks__/image-mock.js'
  }
};
