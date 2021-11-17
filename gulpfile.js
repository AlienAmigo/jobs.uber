"use strict";

const { series, parallel, src, dest, watch } = require("gulp");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const postcssAnimation = require("postcss-animation");
const postcssFlexbugs = require("postcss-flexbugs-fixes");
const browserSync = require("browser-sync").create();
const del = require("del");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const pug = require("gulp-pug");
const prettyHtml = require("gulp-pretty-html");
const replace = require("gulp-replace");
const ghPages = require("gh-pages");
const path = require("path");
const cpy = require("cpy");
const imagemin = require("gulp-imagemin");
const spritesmith = require("gulp.spritesmith");
const merge = require("merge-stream");
const buffer = require("vinyl-buffer");

const nth = {};
nth.config = require("./config.js");

const dir = nth.config.dir;
const options = nth.config.options;

/**
 * Проверка существования файла или папки
 * @param  {string} path      Путь до файла или папки
 * @return {boolean}
 */
function fileExist(filepath) {
  let flag = true;
  try {
    fs.accessSync(filepath, fs.F_OK);
  } catch (e) {
    flag = false;
  }
  return flag;
}

// копирование дополнительных файлов в проект
function copyAssets(cb) {
  if (options.copyAssets) {
    for (let item in nth.config.addAssets) {
      let dest = `${dir.build}${nth.config.addAssets[item]}`;
      cpy(item, dest);
    }
    cb();
  } else {
    cb();
  }
}
exports.copyAssets = copyAssets;

// отправка папки build на gh-pages
function deploy(cb) {
  ghPages.publish(path.join(process.cwd(), "./build"), cb);
}
exports.deploy = deploy;

function compilePug() {
  return src(dir.src + "pages/**/*.pug")
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err.message);
          this.emit("end");
        },
      })
    )
    .pipe(pug())
    .pipe(
      prettyHtml({
        indent_size: 2,
        indent_char: " ",
        unformatted: ["code", "em", "strong", "span", "i", "b", "br"],
        content_unformatted: [],
      })
    )
    .pipe(
      replace(/^(\s*)(<button.+?>)(.*)(<\/button>)/gm, "$1$2\n$1  $3\n$1$4")
    )
    .pipe(
      replace(
        /^( *)(<.+?>)(<script>)([\s\S]*)(<\/script>)/gm,
        "$1$2\n$1$3\n$4\n$1$5\n"
      )
    )
    .pipe(
      replace(
        /^( *)(<.+?>)(<script\s+src.+>)(?:[\s\S]*)(<\/script>)/gm,
        "$1$2\n$1$3$4"
      )
    )
    .pipe(dest(dir.build));
}
exports.compilePug = compilePug;

function compileStyles() {
  return src(dir.src + "scss/style.scss")
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err.message);
          this.emit("end");
        },
      })
    )
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(
      postcss([
        postcssAnimation(),
        postcssFlexbugs(),
        autoprefixer({ overrideBrowserslist: ["last 2 version"] }),
      ])
    )
    .pipe(sourcemaps.write("/"))
    .pipe(dest(dir.build + "css/"))
    .pipe(browserSync.stream());
}
exports.compileStyles = compileStyles;

function processJs(cb) {
  if (options.processJs)
    return src(dir.src + "js/script.js")
      .pipe(
        plumber({
          errorHandler: function (err) {
            console.log(err.message);
            this.emit("end");
          },
        })
      )
      .pipe(
        babel({
          presets: ["@babel/env"],
        })
      )
      .pipe(uglify())
      .pipe(concat("script.min.js"))
      .pipe(dest(dir.build + "js/"));
    else {
      cb();
    }
}
exports.processJs = processJs;

function copyJsVendors(cb) {
  if (options.copyJsVendors) {
    return src(["node_modules/svg4everybody/dist/svg4everybody.min.js"])
      .pipe(concat("vendors.min.js"))
      .pipe(dest(dir.build + "js/"));
  }
  else {
    cb();
  };
}

function copyImages() {
  return src([
    dir.src + "img/**/*.{jpg,jpeg,png,svg,webp,gif,webmanifest}",
    "!"+dir.src+"img/spritesmith/*.{jpg,jpeg,png,svg,webp,gif,webmanifest}"
  ]
    ).pipe(
    dest(dir.build + "img/")
  );
}
exports.copyImages = copyImages;

function copyVideo() {
  return src(dir.src + "video/**/*{.mp4,.avi,.webm}").pipe(
    dest(dir.build + "video/")
  );
}
exports.copyVideo = copyVideo;

function copyFonts() {
  return src(dir.src + "fonts/**/*.{ttf,eot,svg,woff,woff2}").pipe(
    dest(dir.build + "fonts/")
  );
}
exports.copyFonts = copyFonts;

// создание png-спрайта
// создание png-спрайта
function generatePngSprite(cb) {
  let spritePngPath = `${dir.src}img/spritesmith/`;
  if (!fileExist(spritePngPath + "*.{jpg,jpeg,png,webp,gif}")) {
    let spriteData = src(`${spritePngPath}*.{jpg,jpeg,png,webp,gif}`).pipe(
      spritesmith({
        imgName: "sprite-png.png", // название собраного спрайта
        cssName: "_sprite-png.scss", // название css файла
        padding: 4,
        imgPath: "../img/sprite-png.png",
      })
    );
    let styleStream = spriteData.css.pipe(dest(`${dir.src}scss/`));

    let imgStream = spriteData.img
      .pipe(buffer())
      .pipe(imagemin([imagemin.optipng({ optimizationLevel: 5 })]))
      .pipe(dest(`${dir.build}img/`))
      .pipe(dest(`${dir.src}img/`));

    return merge(imgStream, styleStream);
  } else {
    cb();
  }
}

exports.generatePngSprite = generatePngSprite;

function clean() {
  return del(dir.build);
}
exports.clean = clean;

function serve() {
  browserSync.init({
    server: dir.build,
    startPath: "index.html",
    open: false,
    port: 8080,
  });
  watch(
    [dir.src + "scss/*.scss", dir.src + "scss/blocks/*.scss"],
    compileStyles
  );
  watch([dir.src + "pages/*.pug", dir.src + "pug/**/*.pug"], compilePug);
  watch(dir.src + "js/**/*.js", processJs);
  watch(dir.src + "img/spritesmith/*.{jpg,jpeg,png,webp,gif}", generatePngSprite);
  watch([
    dir.src + "img/**/*.{jpg,jpeg,png,svg,webp,gif,webmanifest}",
    "!"+dir.src+"img/spritesmith/*.{jpg,jpeg,png,svg,webp,gif,webmanifest}"
  ],
    copyImages
  );
  watch([
    dir.build + "*.html",
    dir.build + "js/*.js",
    dir.build + "img/**/*.{jpg,jpeg,png,svg,webp,gif,webmanifest}",
  ]).on("change", browserSync.reload);
}

exports.build = series(
  clean,
  parallel(
    compileStyles,
    compilePug,
    processJs,
    copyJsVendors,
    generatePngSprite,
    copyImages,
    copyVideo,
    copyFonts,
    copyAssets,
  )
);

exports.default = series(
  clean,
  parallel(
    compileStyles,
    compilePug,
    processJs,
    copyJsVendors,
    generatePngSprite,
    copyImages,
    copyVideo,
    copyFonts,
    copyAssets
  ),
  serve
);
