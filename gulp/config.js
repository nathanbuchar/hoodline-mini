'use strict';

const path = require('path');

/**
 * Directory paths.
 */
module.exports.paths = {
  app: 'app',
  assets: 'app/assets',
  src: {
    scripts: 'app/assets/js/src',
    styles: 'app/assets/css/src'
  },
  dist: {
    scripts: 'app/assets/js',
    styles: 'app/assets/css'
  }
};

/**
 * Application files.
 */
module.exports.files = {
  app: 'app.js',
  bundle: 'app.bundle.js',
  main: 'main.scss',
  all: 'all.css'
};

/**
 * File patterns.
 */
module.exports.patterns = {
  all: '**/*',
  js: '**/*.js',
  css: '**/*.css',
  json: '**/*.json',
  jade: '**/*.jade',
  html: '**/*.html',
  templates: '**/*.php',
  sass: '**/*.scss',
  svg: '**/*.svg',
  fonts: '**/*.{ttf,eot,svg,woff,woff2}',
  images: '**/*.{jpe?g,png,gif}',
  ignore(pattern, dir) {
    return '!' + path.join((dir || ''), pattern);
  }
};
