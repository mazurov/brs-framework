const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');

const reload = browserSync.reload;

gulp.task('scripts', function(){
  return gulp.src(['node_modules/babel-polyfill/dist/polyfill.js', 'src/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('brs.js'))
    .pipe(babel({presets: ['es2015']}).on('error', function(err){
        console.error(err.message);
        browserSync.notify(err.message, 5000);
        this.emit('end');
    }))
    // .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('js'))
});

gulp.task('serve', ['scripts'],
    function() {
         browserSync({
            notify: false,
            // Customize the Browsersync console logging prefix
            logPrefix: 'WSK',
            // Allow scroll syncing across breakpoints
            scrollElementMapping: ['main', '.mdl-layout'],
            // Run as an https by uncommenting 'https: true'
            // Note: this uses an unsigned certificate which on first access
            //       will present a certificate warning in the browser.
            // https: true,
            server: '.',
            port: 3000
        });
        gulp.watch(['src/*.js'], ['scripts', reload]);
        gulp.watch(['*.html'], [reload]);
    }
);

gulp.task('default', [ 'serve']);