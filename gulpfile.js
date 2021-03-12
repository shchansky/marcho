const { src, dest, watch, parallel, series } = require('gulp');//src и dest присваиваем возможности gulp

const scss              = require('gulp-sass');//require присваивает все возможности плагина gulp-sass констанете
const concat            = require('gulp-concat');
const autoprefixer      = require('gulp-autoprefixer');
const uglify            = require('gulp-uglify');
const imagemin          = require('gulp-imagemin');
const del               = require('del');
const browserSync       = require('browser-sync').create();


function browsersync () {
    browserSync.init ({
        server: {
           baseDir:'app/' 
        },
        notofy: false
    })
}


function styles() {//функция будет конвертировать scss в css
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'compressed' })) //{outputStyle:'expanded'} --красивый внешний вид файла  css стилей; {outputStyle:'compressed'} -убираются пробелы в cs стилях-минифицированный файл (см.документаццию gulp-sass---outputstyles)
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'], 
            grid: true
        }))
        .pipe(dest('app/css')) //app/css  это папкуа куда будет выкидываться файл css
        .pipe(browserSync.stream())

}

function scripts () {
    return src ([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}


function images () {
    return src('app/images/**/*.*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('dist/images'))
}


function build() {
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js',
    ], {base: 'app'})
    .pipe(dest('dist'))
}


function cleanDist () {
    return del ('dist')
}


function watching () {
    watch (['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;// необходимо для запуска ф-ии styles
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series (cleanDist, images, build );

exports.default = parallel (styles,scripts,browsersync,watching );