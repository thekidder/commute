var webpack = require('webpack');

var baseConfig = require('./webpack.config');

baseConfig.plugins = [
  new webpack.optimize.UglifyJsPlugin()
];

module.exports = baseConfig;
