const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const del = require("del");
const browserSync = require("browser-sync").create();
const svgSprite = require("gulp-svg-sprite");

// Функция браузерсинк
function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
    notofy: false,
  });
}

// Функции для стилей
function styles() {
  return src("app/scss/style.scss")
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 version"],
        grid: true,
      })
    )
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

// Функции для Javascript

function scripts() {
  return src([
    "node_modules/jquery/dist/jquery.js",
    "node_modules/magnific-popup/dist/jquery.magnific-popup.js",
    "node_modules/slick-carousel/slick/slick.js",
    "node_modules/rateyo/src/jquery.rateyo.js",
    "node_modules/mixitup/dist/mixitup.js",
    "app/js/main.js",
  ])
    .pipe(concat("main.min.js"))
    .pipe(uglify()) // Минифицирует js файлы.
    .pipe(dest("app/js"));
}

// Функция Спрайт
function svgSprites() {
  return src("app/images/icons/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(dest("app/images/"));
}

// Картинки функции
function images() {
  return src("app/images/**/*.*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/images"));
}

function build() {
  return src(["app/**/*.html", "app/css/style.min.css", "app/js/main.min.js"], {
    base: "app",
  }).pipe(dest("dist"));
}

function cleanDist() {
  return del("dist");
}

// Автоматическое обновление
function watching() {
  watch(["app/scss/**/*.scss"], styles);
  watch(["app/js/**/*.js", "!app/js/**/main.min.js"], scripts);
  watch(["app/images/icons/*.svg"], svgSprites);
  watch(["app/**/*html"]).on("change", browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, svgSprites, watching);
