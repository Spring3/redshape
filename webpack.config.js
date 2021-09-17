require('dotenv').config({ silent: true });
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { spawn } = require('child_process');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  mode: isProduction ? 'production' : 'development',
  target: 'electron-renderer',
  entry: {
    app: path.resolve(__dirname, 'render/'),
    about: path.resolve(__dirname, 'render/about')
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    // to avoid extra slash at the beginning, that makes the file:// request result in a RESOURCE_NOT_FOUND error
    publicPath: isProduction ? '' : '/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.txt$/,
        use: [
          'raw-loader'
        ]
      }
    ]
  },
  externals: [nodeExternals({
    allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
  })],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.css']
  },
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './render/index.html'),
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: path.resolve(__dirname, './render/about/about.html'),
      chunks: ['about']
    })
  ]
};

if (!isProduction) {
  config.devServer = {
    static: {
      directory: path.resolve(__dirname, './dist'),
      publicPath: '/',
      watch: true,
    },
    client: {
      overlay: false,
    },
    hot: true,
    liveReload: true,
    port: process.env.PORT,
    onBeforeSetupMiddleware: () => spawn('electron', ['.'], { shell: true, env: process.env, stdio: 'inherit' })
      .once('close', () => process.exit(0))
      // eslint-disable-next-line
      .once('error', (spawnError) => console.error(spawnError))
  };

  config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = config;
