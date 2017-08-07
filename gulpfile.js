/* eslint no-console: "off" */

'use strict';

// general
const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const gulpif = require('gulp-if');

// sass
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

// images
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

// javascript
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const gutil = require('gutil');

// sourcemaps
const sourcemaps = require('gulp-sourcemaps');

// browserSync
const browserSync = require('browser-sync').create();

// eslint
const eslint = require('gulp-eslint');

// uglify
const uglify = require('gulp-uglify');

let env = 'dev';
const serverDir = 'server';
const sourceDir = 'client';
const destDir = 'public';

const config = {
  serverSrcDir: `${serverDir}`,
  cssSrcDir: `${sourceDir}/scss`,
  reactSrcDir: `${sourceDir}/react`,
  imgDir: `${sourceDir}/imgs`,
  autoprefixer: {
    browsers: ['> 1%', 'last 2 versions'],
    cascade: true,
    remove: true,
  },
};

// ////////////////////////////////////////////////
// Base Tasks
// ////////////////////////////////////////////////

gulp.task('watch', ['dev-build'], () => {
  gulp.watch('app.js', ['lint']);
  gulp.watch(`${sourceDir}/**/*.html`, ['html']);
  gulp.watch(`${config.serverSrcDir}/**/*.*`, ['lint']);
  gulp.watch(`${config.imgDir}/**/*.*`, ['images']);
  gulp.watch(`${config.cssSrcDir}/**/*.*`, ['styles']);
  gulp.watch(`${config.reactSrcDir}/**/*.*`, ['scripts', 'lint']);
});

gulp.task('dev-build',
  (callback) => runSequence('clean', ['html', 'styles', 'scripts', 'images', 'lint'], (err) => {
    // if any error happened in the previous tasks, exit with a code > 0
    if (err) {
      const exitCode = 2;
      console.log('[ERROR] gulp dev-build task failed', err);
      console.log(`[FAIL] gulp dev-build task failed - exiting with code ${exitCode}`);
      return process.exit(exitCode);
    }

    return callback();
  }));

gulp.task('build',
  (callback) => runSequence('dev-build', ['compress'], (err) => {
    // if any error happened in the previous tasks, exit with a code > 0
    if (err) {
      const exitCode = 2;
      console.log('[ERROR] gulp build task failed', err);
      console.log(`[FAIL] gulp build task failed - exiting with code ${exitCode}`);
      return process.exit(exitCode);
    }

    return callback();
  }));


gulp.task('deploy', () => {
  env = 'prod';
  gulp.start('build');
});

gulp.task('default', () => gulp.start('build'));


// ////////////////////////////////////////////////
// Task Details
// ////////////////////////////////////////////////

gulp.task('clean', del.bind(null, [destDir]));

gulp.task('html', () => gulp.src('./client/**/*.html').pipe(gulp.dest('./public')));

gulp.task('styles', () => {
  const files = `${config.cssSrcDir}/**/*.scss`;

  const sassOptions = {
    outputStyle: (env === 'dev') ? 'nested' : 'compressed',
    includePaths: ['node_modules'],
  };

  return gulp.src(files)
  .pipe(gulpif(env === 'dev', sourcemaps.init()))
        .pipe(sass(sassOptions)) // .on('error', sass.logError)) !!! fneed to fail on error!!!
        .pipe(autoprefixer(config.autoprefixer))
        .pipe(gulpif(env === 'dev', sourcemaps.write()))
        .pipe(gulp.dest(`${destDir}/css`))
        .pipe(gulpif(env === 'dev', browserSync.stream()));
});

gulp.task('scripts',
  (callback) => {
    webpack(webpackConfig, (err, stats) => {
      console.log(err);

      if (err) {
        throw new gutil.PluginError('webpack', err);
      }

      gutil.log('[webpack]', stats.toString({
        colors: true,
        modules: false,
        reasons: false,
        errorDetails: true,
      }));

        // needed for runSequence
      callback();
    });
  });

gulp.task('compress', () => (
  gulp.src(`${destDir}/js/bundle.js`)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(`${destDir}/js`))
));

gulp.task('images', () => {
  const files = [
    `${config.imgDir}/png/**/*.*`,
    `${config.imgDir}/svg/**/*.*`,
  ];

  return gulp.src(files)
  .pipe(newer(`${destDir}/imgs`))
  .pipe(imagemin())
  .pipe(gulp.dest(`${destDir}/imgs`));
});

/**
 * ESLINT
 */

// ESLint ignores files with "node_modules" paths.
// So, it's best to have gulp ignore the directory as well.
// Also, Be sure to return the stream from the task;
// Otherwise, the task may end before the stream has finished.
gulp.task('lint', () => gulp.src(['./**/*.js', './**/*.jsx', '!**/node_modules/**', '!./public/**', '!./test/**'])
  // eslint() attaches the lint output to the "eslint" property
  // of the file object so it can be used by other modules.
  .pipe(eslint())
  // eslint.format() outputs the lint results to the console.
  // Alternatively use eslint.formatEach() (see Docs).
  .pipe(eslint.format())
  // To have the process exit with an error code (1) on
  // lint error, return the stream and pipe to failAfterError last.
  .pipe(eslint.failAfterError()));
