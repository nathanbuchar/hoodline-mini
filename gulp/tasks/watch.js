'use strict';

module.exports = (gulp, config) => {

  // Watch scripts.
  gulp.watch(config.patterns.js, { cwd: config.paths.src.scripts }, ['scripts']);

  // Watch styles.
  gulp.watch(config.patterns.sass, { cwd: config.paths.src.styles }, ['styles']);
};
