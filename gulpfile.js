const { src, dest, watch, parallel, series } = require('gulp');//src и dest присваиваем возможности gulp     src, dest, watch, parallel (для одновременного запуска browsersync,watching и прочего), series--это команды галпа

const scss              = require('gulp-sass');//require присваивает все возможности плагина gulp-sass констанете
const concat            = require('gulp-concat');
const autoprefixer      = require('gulp-autoprefixer');
const uglify            = require('gulp-uglify');
const imagemin          = require('gulp-imagemin');
const rename            = require('gulp-rename');
const nunjucksRender    = require('gulp-nunjucks-render');
const del               = require('del');
const browserSync       = require('browser-sync').create();// .create() указано в документации browser-sync


function browsersync () {//прописыыаем функции вместо gulp.task(что в документации)  функции это более современно
    browserSync.init ({//далее копируем указния с документации
        server: {
           baseDir:'app/' //в этой паке будет сервер
        },
        notify: false//чтобы в верхнем правом углу браузера не было сообщиний что работает браузерсинк
    })
}


function nunjucks() {
    return src('app/*.njk')
        .pipe (nunjucksRender())
        .pipe (dest('app'))
        .pipe(browserSync.stream())
}


function styles() {//функция будет конвертировать scss в css
    return src('app/scss/*.scss')
        .pipe(scss({ outputStyle: 'compressed' })) //{outputStyle:'expanded'} --красивый внешний вид файла  css стилей; {outputStyle:'compressed'} -убираются пробелы в cs стилях-минифицированный файл (см.документаццию gulp-sass---outputstyles)
        // .pipe(concat())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'], 
            grid: true
        }))
        .pipe(dest('app/css')) //app/css  это папкуа куда будет выкидываться минифицированный файл css       dest-это выкидывать 
        .pipe(browserSync.stream())// страница обновляется через плагин browserSync после тога как в папку app/css через dest закинется файл

}

function scripts () {
    return src ([
        'node_modules/jquery/dist/jquery.js',// подключаем jquery котрый скачался в папку node_modules
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
        'node_modules/rateyo/src/jquery.rateyo.js',
        'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
        'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())// страница обновляется через плагин browserSync после тога как в папку app/js через dest закинется файл
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


function build() {//для переноса файлов в папку dist
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js',
    ], {base: 'app'})//чтобы все файлы перенеслись точно также как они храняться в директории app
    .pipe(dest('dist'))
}


function cleanDist () {// удаляет папку dist
    return del ('dist')
}


function watching () {//следит за css,  html,  js
    watch (['app/**/*.scss'], styles); //при изменениях автоматически выполняется task типа styles и автоматом запускается exports.styles = styles
    watch (['app/*.njk'], nunjucks);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);// нужно следить за всеми файлами app/js/**/*.js    но кроме   !app/js/main.min.js
    watch(['app/**/*.html']).on('change', browserSync.reload);//следим за html через плагин browserSync
}

exports.styles = styles;// необходимо для запуска ф-ии styles---для этого в консоли ввести gulp styles
exports.scripts = scripts;// необходимо для запуска ф-ии scripts---для этого в консоли ввести gulp scripts  и в файле main.min.js будет минифицированный js 
exports.browsersync = browsersync;
exports.watching = watching;// необходимо для запуска ф-ии watching
exports.images = images;
exports.nunjucks = nunjucks;
exports.cleanDist = cleanDist;
exports.build = series (cleanDist, images, build );

exports.default = parallel (nunjucks,styles,scripts,browsersync,watching );//default---task по дефолту, в комадной строке пишется gulp и одновременно запускаются разом все таски в скобках, т.е. не надо прописывать в комадной по отдельности gulp styles, gulp scripts и прочее;   parallel для возможности одновременной browsersync,watching и прочего