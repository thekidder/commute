var webpack = require('webpack');

var baseConfig = require('./webpack.config');

baseConfig.devtool = 'cheap-module-eval-source-map';
baseConfig.entry = [
  'babel-polyfill',
  'webpack-hot-middleware/client',
  './src/index'
];
baseConfig.plugins = [
  new webpack.HotModuleReplacementPlugin()
];
// add react-hot
baseConfig.module.loaders[0].loaders = ['react-hot', 'babel'];

module.exports = baseConfig;
