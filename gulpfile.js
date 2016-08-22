'use strict';

const dotenv = require('dotenv');
const gulp = require('gulp');
const sequence = require('gulp-sequence');

/**
 * Load in Gulp configuration.
 */
const config = require('./gulp/config');

/**
 * Register gulp tasks.
 */
require('gulp-import-tasks')({
  dir: 'gulp/tasks',
  params: [
    config
  ]
});

/**
 * Default task.
 */
gulp.task('default', sequence(
  'build'
));

/**
 * Build and compile client-side resources.
 */
gulp.task('build', sequence(
  ['scripts', 'styles']
));

/**
 * Builds client-side resources and then watches for changes.
 */
gulp.task('build:watch', sequence(
  'build',
  'watch'
));
