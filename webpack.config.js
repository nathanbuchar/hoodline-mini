'use strict';

const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

const options = {
  entry: './app/src/entry.js',
  output: {
    path: './app/dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      }
    ]
  },
  sassLoader: {
    data: `$env: ${process.env.NODE_ENV};`
  }
};

options.target = webpackTargetElectronRenderer(options);

module.exports = options;
