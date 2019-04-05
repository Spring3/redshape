const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { spawn } = require('child_process');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'electron-renderer',
  entry: path.resolve(__dirname, 'app'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: path.resolve(__dirname, '/'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  externals: [nodeExternals({
    whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
  })],
  resolve: {
    extensions: ['.js', '.jsx', '.css']
  },
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './app/index.html')
    })
  ]
};

if (config.mode === 'development') {
  config.devServer = {
    contentBase: path.resolve(__dirname, './dist'),
    publicPath: path.resolve(__dirname, '/'),
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    stats: {
      colors: true,
      chunks: false,
      children: false
    },
    before: () => spawn('electron', ['.'], { shell: true, env: process.env, stdio: 'inherit' })
      .once('close', () => process.exit(0))
      .once('error', spawnError => console.error(spawnError))
  };

  config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = config;
