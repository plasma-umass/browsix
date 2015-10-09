'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var copy = require('gulp-copy');
var merge = require('merge2');
var ts = require('gulp-typescript');
var lint = require('gulp-tslint');
var runSequence = require('run-sequence');
var mocha = require('gulp-mocha');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var karma = require('karma');


// each user of our tsconfig.json setup needs a different instance of
// the 'ts project', as gulp-typescript seems to use it as a dumping
// ground.
function project() {
    return ts.createProject('tsconfig.json', {
        sortOutput: true,
        declaration: true,
    });
}

function tsPipeline(src, dst) {
    return function() {
        var build = gulp.src(src)
            .pipe(ts(project()));
        return merge(build.js, build.dts).pipe(gulp.dest(dst));
    }
}

function tsTask(subdir, options) {
    options = options || {};
    var buildDeps = options.buildDeps || [];
    var otherSources = options.otherSources || [];

    gulp.task('lint-'+subdir, function() {
        return gulp.src(['src/'+subdir+'/*.ts'])
            .pipe(lint())
            .pipe(lint.report('verbose'));
    });

    if (!options.hasOwnProperty('lint') || options.lint)
	buildDeps = buildDeps.concat(['lint-'+subdir]);

    gulp.task('build-'+subdir, buildDeps, tsPipeline(['src/'+subdir+'/*.ts', 'src/'+subdir+'/**/*.ts'].concat(otherSources), 'lib/'+subdir));

    gulp.task('dist-'+subdir, ['build-'+subdir], function() {
        var b = browserify({
            entries: ['./lib/'+subdir+'/'+subdir+'.js'],
            builtins: false,
            insertGlobalVars: {
                // don't do shit when seeing use of 'process'
                'process': function() { return "" },
            },
        });
        b.exclude('webworker-threads');

        return b.bundle()
            .pipe(source('./lib/'+subdir+'/'+subdir+'.js'))
            .pipe(buffer())
        //            .pipe(uglify())
            .on('error', gutil.log)
            .pipe(gulp.dest('./dist/'));
    });
}

gulp.task('copy-node', function() {
    return gulp.src([
	'node/lib/internal/util.js',
	'node/lib/_stream_*.js',
	'node/lib/events.js',
	'node/lib/constants.js',
	'node/lib/path.js',
	'node/lib/stream.js',
	'node/lib/util.js',
	'node/lib/buffer.js',
	'node/lib/fs.js',
	'node/lib/vm.js',
	'node/lib/domain.js',
	'node/lib/string_decoder.js',
    ]).pipe(copy('./lib/browser-node/', {prefix: 2}));
});

tsTask('kernel', {otherSources: ['!src/kernel/vendor/BrowserFS/test/**/*.ts', '!src/kernel/vendor/BrowserFS/src/browserify_main.ts']});
tsTask('browser-node', {buildDeps: ['copy-node']});
tsTask('bin');

gulp.task('build-test', ['dist-kernel', 'dist-browser-node', 'build-bin'], function() {
    return gulp.src('test/*.ts')
        .pipe(ts(project())).js
        .pipe(gulp.dest('test'));
});

gulp.task('dist-test', ['build-test'], function() {
    var b = browserify({
            entries: ['./test/test-all.js'],
            builtins: false,
            insertGlobalVars: {
                // don't do shit when seeing use of 'process'
                'process': function() { return "" },
                'buffer': function() { return "require(./buffer)" },
            },
        });
        b.exclude('webworker-threads');

        return b.bundle()
            .pipe(source('./test/test-all.js'))
            .pipe(buffer())
//            .pipe(uglify())
            .on('error', gutil.log)
            .pipe(gulp.dest('./dist/'));

});

gulp.task('test-node', ['dist-test'], function() {
    return gulp.src('test/*.js').pipe(mocha());
});


gulp.task('test-browser', ['dist-test'], function(done) {
    new karma.Server({
	configFile: __dirname + '/karma.conf.js',
	singleRun: false,
    }, done).start();

    gulp.watch(['src/**/*.ts', 'test/*.ts'], ['dist-test', reload]);
});


gulp.task('default', ['dist-test'], function(done) {
    new karma.Server({
	configFile: __dirname + '/karma.conf.js',
	singleRun: true,
    }, done).start();
});

gulp.task('serve', ['dist-kernel', 'dist-browser-node', 'build-bin'], function() {
    browserSync({
        port: 5000,
        notify: false,
        logPrefix: 'browsix',
        snippetOptions: {
            rule: {
                match: '<span id="browser-sync-binding"></span>',
                fn: function(snippet) { return snippet; },
            },
        },
        server: { baseDir: ['.'] },
    });

    gulp.watch(['index.html'], reload);
    gulp.watch(['src/**/*.ts', 'test/*.js'], ['dist-kernel', 'dist-browser-node', 'build-bin', reload]);
});
