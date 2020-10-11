// const gulp = require('gulp');
const { series, parallel, dest, src, watch } = require('gulp');
/* html */
const ejs = require('gulp-ejs');
const htmlmin = require('gulp-htmlmin');
/* css */
const sass = require('gulp-sass');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
/* js */
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
/* img */
const imagemin = require('gulp-imagemin');
/* ohters */
const rename = require("gulp-rename");
const concat = require('gulp-concat');
const cache = require('gulp-cache');
const plumber = require('gulp-plumber');
const notify = require("gulp-notify");

/* local server */
const browserSync = require('browser-sync').create();
/* remove build directory */
const rimraf = require("rimraf");


const filesPath = {
  sass: "./src/sass/**/*.scss",
  less: "./src/less/**/*.less",
  ejs: "./src/ejs/**/*.ejs",
  js: "./src/js/**/*.js",
  images: "./src/img/**/*.+(png|jpg|jpeg|gif|svg)"
};

// Sass
const sassTask = done => {
  src([filesPath.sass, '!./src/sass/**/_*.scss'])
    .pipe(plumber({
      errorHandler: notify.onError({
        title: "Sassエラー！", // 任意のタイトルを表示させる
        message: "<%= error.message %>" // エラー内容を表示させる
      })
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(sourcemaps.write("."))
    .pipe(rename((path) => {
      if (!path.extname.endsWith(".map")) {
        path.basename += ".min";
      }
    }))
    .pipe(dest('./dist/css'));
  done();
};

// Less
const lessTask = (done) => {
  src([filesPath.less])
    .pipe(plumber({
      errorHandler: notify.onError({
        title: "Lessエラー！", // 任意のタイトルを表示させる
        message: "<%= error.message %>" // エラー内容を表示させる
      })
    }))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write("."))
    .pipe(rename("./style.min.css"))
    .pipe(dest('./dist/css'))
  done();
};

//Javascript
const jsTask = (done) => {
  src(["./src/js/alert.js", "./src/js/project.js"]) // 順番指定
    .pipe(plumber({
      errorHandler: notify.onError({
        title: "Javascriptエラー！", // 任意のタイトルを表示させる
        message: "<%= error.message %>" // エラー内容を表示させる
      })
    }))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat("project.js"))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(dest("./dist/js"))
  done();
};

// Images optimization
const imgTask = (done) => {
  return src(filesPath.images)
    .pipe(cache(imagemin()))
    .pipe(dest("./dist/img/"));
  done();
};

// EJS
const ejsTask = (done) => {
  src([filesPath.ejs, '!' + "./src/ejs/**/_*.ejs"])
    .pipe(plumber({
      errorHandler: notify.onError({
        title: "EJSエラー！", // 任意のタイトルを表示させる
        message: "<%= error.message %>" // エラー内容を表示させる
      })
    }))
    .pipe(ejs({}, {}, { ext: '.html' }))
    .pipe(rename({ extname: ".html" }))
    // .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest("./dist/"));
  done();
};

// Clean cache
const cleanCacheTask = (done) => {
  return cache.clearAll();
  done();
};

// Clean
const cleanTask = (done) => {
  rimraf("./dist", done);
};

// Watch task with BrowserSync
const watchTask = (done) => {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    },
    browser: "google chrome",
  });

  watch(
    [
      filesPath.sass,
      filesPath.ejs,
      filesPath.less,
      filesPath.js,
      filesPath.images
    ],
    parallel([sassTask, lessTask, jsTask, imgTask, ejsTask])
  )
    .on('change', browserSync.reload);
  done();
};




exports.sassTask = sassTask;
exports.lessTask = lessTask;
exports.jsTask = jsTask;
exports.imgTask = imgTask;
exports.ejsTask = ejsTask;
exports.cleanCacheTask = cleanCacheTask;
exports.cleanTask = cleanTask;

exports.watchTask = watchTask;
exports.build = parallel([sassTask, lessTask, jsTask, imgTask, ejsTask]);

// Gulp default command
exports.default = series(exports.build, watchTask);

