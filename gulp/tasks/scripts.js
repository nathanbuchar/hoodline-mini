'use strict';

const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const gulpif = require('gulp-if');
const path = require('path');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');

module.exports = (gulp, config) => {
  const b = browserify({
    entries: path.join(config.paths.src.scripts, config.files.app),
    ignoreMissing: true,
    detectGlobals: false,
    bare: true,
    debug: gutil.env.release
  });

  return b.bundle()
    .pipe(
      source(config.files.bundle))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(
          gulpif(gutil.env.release, uglify({ mangle: false })))
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.paths.dist.scripts));
};
