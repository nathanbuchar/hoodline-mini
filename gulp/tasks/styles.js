'use strict';

const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

module.exports = (gulp, config) => {
  return gulp.src(config.files.main, {
    cwd: config.paths.src.styles
  })
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(rename(config.files.all))
  .pipe(gulp.dest(config.paths.dist.styles));
};
