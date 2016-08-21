'use strict';

const dotenv = require('dotenv');
const gulp = require('gulp');
const sequence = require('gulp-sequence');

/**
 * Load in environment variables if they exist.
 */
dotenv.config({ silent: true });

/**
 * Register gulp tasks.
 */
require('gulp-import-tasks')({
  dir: 'gulp/tasks',
  params: [
    require('./gulp/config')
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
