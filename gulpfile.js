'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var copy = require('gulp-copy');
var rename = require('gulp-rename');
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
var run = require('gulp-run');


// each user of our tsconfig.json setup needs a different instance of
// the 'ts project', as gulp-typescript seems to use it as a dumping
// ground for mutable state.
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

// creates tasks representing the build lifecycle of a typescript package:
// - lint (optional)
// - build w/ tsc
// - dist  w/ browserify
function tsTask(subdir, options) {
    options = options || {};
    var buildDeps = options.buildDeps || [];
    var otherSources = options.otherSources || [];
    var sources = ['src/'+subdir+'/*.ts', 'src/'+subdir+'/**/*.ts'].concat(otherSources);

    gulp.task('lint-'+subdir, function() {
        return gulp.src(['src/'+subdir+'/*.ts'])
            .pipe(lint())
            .pipe(lint.report('verbose'));
    });

    // lint by default, but if lint is specified as 'false' skip it.
    if (!options.hasOwnProperty('lint') || options.lint)
        buildDeps = buildDeps.concat(['lint-'+subdir]);

    gulp.task('build-'+subdir, buildDeps, tsPipeline(sources, 'lib/'+subdir));

    gulp.task('dist-'+subdir, ['build-'+subdir], function() {
        var b = browserify({
            entries: ['./lib/'+subdir+'/'+subdir+'.js'],
            builtins: false,
            insertGlobalVars: {
                // don't do anything when seeing use of 'process' - we
                // handle this ourselves.
                'process': function() { return "" },
            },
        });
        b.exclude('webworker-threads');

        return b.bundle()
            .pipe(source('./lib/'+subdir+'/'+subdir+'.js'))
            .pipe(buffer())
        //          .pipe(uglify())
            .on('error', gutil.log)
            .pipe(gulp.dest('./dist/'));
    });
}

gulp.task('copy-node', function() {
    return gulp.src([
        'node/lib/internal/util.js',
        // 'node/lib/internal/child_process.js', -- not this, we have to override ourselves
        'node/lib/_stream_*.js',
        'node/lib/events.js',
        'node/lib/constants.js',
        'node/lib/path.js',
        'node/lib/stream.js',
        'node/lib/string_decoder.js',
        'node/lib/util.js',
        'node/lib/buffer.js',
        'node/lib/fs.js',
        'node/lib/vm.js',
        'node/lib/domain.js',
        'node/lib/string_decoder.js',
    ]).pipe(copy('./lib/browser-node/', {prefix: 2}));
});

// the kernel directly uses BrowserFS's typescript modules - we need
// to explicitly exclude tests and the browserify main here to avoid
// confusing tsc :\
tsTask('kernel', {otherSources: ['!src/kernel/vendor/BrowserFS/test/**/*.ts', '!src/kernel/vendor/BrowserFS/src/browserify_main.ts']});
tsTask('browser-node', {buildDeps: ['copy-node']});
tsTask('bin');

gulp.task('build-fs', ['dist-kernel', 'dist-browser-node', 'build-bin'], function() {
    const copyKernel = gulp.src('dist/lib/kernel/kernel.js').pipe(copy('./fs/boot/', {prefix: 3}));
    const copyNode = gulp.src('dist/lib/browser-node/browser-node.js')
          .pipe(rename(function(path) { path.basename = 'node'; path.extname = ''; }))
          .pipe(gulp.dest('./fs/usr/bin/'));
    const copyBin = gulp.src('lib/bin/*.js')
          .pipe(rename(function(path) { path.extname = ''; }))
          .pipe(gulp.dest('./fs/usr/bin/'));

    return merge(copyKernel, copyNode, copyBin);
});

gulp.task('index-fs', ['build-fs'], function() {
    return run('./xhrfs-index fs').exec()
        .pipe(rename(function(path) { path.basename = 'index'; path.extname = '.json'; }))
        .pipe(gulp.dest('./fs'));
});

gulp.task('build-test', ['index-fs'], function() {
    return gulp.src('test/*.ts')
        .pipe(ts(project())).js
        .pipe(gulp.dest('test'));
});

gulp.task('dist-test', ['build-test'], function() {
    const testMain = './test/test-all.js';
    var b = browserify({
        entries: [testMain],
        builtins: false,
        insertGlobalVars: {
            // don't do shit when seeing use of 'process'
            'process': function() { return "" },
        },
    });
    b.exclude('webworker-threads');

    return b.bundle()
        .pipe(source(testMain))
        .pipe(buffer())
    //          .pipe(uglify())
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
        autoWatchBatchDelay: 1000,
    }, done).start();

    gulp.watch(['src/**/*.ts', 'test/*.ts'], ['dist-test']);
});


gulp.task('default', ['dist-test'], function(done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        browsers: ['Firefox'],
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
