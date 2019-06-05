module.exports = {
  presets: [
    [
      '@babel/react', {
        exclude: ['transform-regenerator', 'transform-async-to-generator'],
        debug: true,
        modules: false,
        useBuiltIns: 'usage'
      }
    ]
  ],
  plugins: [
    'module:fast-async',
    '@babel/plugin-proposal-class-properties',
    ['babel-plugin-styled-components',
      {
        displayName: true,
        preprocess: false
      }
    ]
  ],
  env: {
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs'
      ]
    }
  }
};
