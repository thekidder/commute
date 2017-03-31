var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'static/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
        include: [path.join(__dirname, 'src'), path.join(__dirname, 'node_modules')]
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2)?$/,
        loader: 'url?limit=8192'
      }
    ]
  }
};
