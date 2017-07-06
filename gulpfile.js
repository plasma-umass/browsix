'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var copy = require('gulp-copy');
var rename = require('gulp-rename');
var merge = require('merge2');
var ts = require('gulp-typescript');
var lint = require('gulp-tslint');
var mocha = require('gulp-mocha');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var karma = require('karma');
var run = require('gulp-run');
var chmod = require('gulp-chmod');
var proxy = require('proxy-middleware');
var url = require('url');
var extend = require('util')._extend;

var $ = require('gulp-load-plugins')();
var del = require('del');
var path = require('path');
var fs = require('fs');
var historyApiFallback = require('connect-history-api-fallback');

var addShebang = require('./gulp-plugins/add-shebang');


// don't do anything when seeing use of several node builtins -- we
// handle this ourselves.
var globalVars = {
    'RELEASE': function() { return 'false'; },
    'buffer': function() { return 'require("browserfs").BFSRequire("buffer")'; },
    'Buffer': function() { return 'require("browserfs").BFSRequire("buffer").Buffer'; },
    'process': function() { return "" },
};

var builtins = {
//    'process': function() { return "" },

//    'Buffer': function() { return "" },
//    'buffer': require.resolve('bfs-buffer'),
    'path': require.resolve('bfs-path'),
};

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
        return merge(
	    build.js.pipe(gulp.dest(dst)),
	    build.dts.pipe(gulp.dest(dst)));
    }
}

// creates tasks representing the build lifecycle of a typescript package:
// - lint (optional)
// - build w/ tsc
// - dist  w/ browserify
function tsTask(subdir, options) {
    options = options || {};
    var noBuffer = options.noBuffer;
    var noGlobal = options.noGlobal;
    var buildDeps = options.buildDeps || [];
    var otherSources = options.otherSources || [];
    var sources = ['src/'+subdir+'/*.ts', 'src/'+subdir+'/**/*.ts'].concat(otherSources);

    gulp.task('lint-'+subdir, function() {
        return gulp.src(['src/'+subdir+'/*.ts', 'src/'+subdir+'/*/*.ts'])
            .pipe(lint({
		formatter: "verbose"
	    }))
            .pipe(lint.report());
    });

    // run lint by default, but if lint is specified as 'false' skip it
    if (!options.hasOwnProperty('lint') || options.lint)
        buildDeps = buildDeps.concat(['lint-'+subdir]);

    gulp.task('build-'+subdir, buildDeps, tsPipeline(sources, 'lib/'+subdir));

    var globals = extend({}, globalVars);
    if (noGlobal)
        globals['global'] = function() { return ""; };
    if (noBuffer) {
        globals['buffer'] = function() { return ""; };
        globals['Buffer'] = function() { return ""; };
    }

    gulp.task('dist-'+subdir, ['build-'+subdir], function() {
        var b = browserify({
            entries: ['./lib/'+subdir+'/'+subdir+'.js'],
            builtins: builtins,
            insertGlobalVars: globals,
        });
        b.exclude('webworker-threads');

        return b.bundle()
            .pipe(source('./lib/'+subdir+'/'+subdir+'.js'))
            .pipe(buffer())
        //  .pipe(uglify())
            .on('error', gutil.log)
            .pipe(gulp.dest('./lib-dist/'));
    });
}

gulp.task('copy-node-kernel', function() {
    return gulp.src([
        'node-modified/lib/binding/http_parser.js',
    ]).pipe(copy('./lib/kernel/', {prefix: 3}));
});

gulp.task('copy-node', function() {
    return gulp.src([
        'node/lib/internal/util.js',
        'node/lib/internal/freelist.js',
        'node-modified/lib/binding/http_parser.js',
        'node-modified/lib/internal/child_process.js',
        'node/lib/_linklist.js',
        'node/lib/_stream_*.js',
        'node/lib/events.js',
        'node/lib/constants.js',
        'node/lib/path.js',
        'node/lib/stream.js',
        'node/lib/string_decoder.js',
        'node/lib/util.js',
        'node/lib/buffer.js',
        'node/lib/assert.js',
        'node/lib/fs.js',
        'node/lib/vm.js',
        'node/lib/readline.js',
        'node/lib/domain.js',
        'node/lib/timers.js',
        'node/lib/string_decoder.js',
        'node/lib/child_process.js',
        'node/lib/dns.js',
        'node/lib/dgram.js',
        'node/lib/cluster.js',
        'node/lib/net.js',
        'node/lib/querystring.js',
        'node/lib/punycode.js',
        'node/lib/url.js',
        'node/lib/_http_agent.js',
        'node/lib/_http_common.js',
        'node/lib/_http_incoming.js',
        'node/lib/_http_outgoing.js',
        'node/lib/_http_client.js',
        'node/lib/_http_server.js',
        'node/lib/http.js',
    ]).pipe(copy('./lib/browser-node/', {prefix: 2}));
});

// the kernel directly uses BrowserFS's typescript modules - we need
// to explicitly exclude tests and the browserify main here to avoid
// confusing tsc :\
tsTask('kernel', {buildDeps: ['copy-node-kernel', 'copy-node']});
tsTask('browser-node', {buildDeps: ['copy-node'], noBuffer: true});
tsTask('bin');
tsTask('syscall-api', {buildDeps: ['build-browser-node'], noGlobal: true});
tsTask('hello-sync', {noGlobal: true});

// next, we need to collect the various pieces we've built, and put
// then in a sane directory hierarchy.  There is no dist step needed
// for our binaries - they are self contained and meant to be run
// directly from node or browser-node.
gulp.task('build-fs-pre', ['dist-kernel', 'dist-browser-node', 'build-bin', 'dist-syscall-api'], function() {

    var copyKernel = gulp.src('lib-dist/lib/kernel/kernel.js')
          .pipe(copy('./fs/boot/', {prefix: 3}));

    var copyNode = gulp.src('lib-dist/lib/browser-node/browser-node.js')
          .pipe(rename(function(path) { path.basename = 'node'; path.extname = ''; }))
          .pipe(gulp.dest('./fs/usr/bin/'));

    var copyBin = gulp.src('lib/bin/*.js')
          .pipe(rename(function(path) { path.extname = ''; }))
          .pipe(addShebang('#!/usr/bin/env node\n'))
          .pipe(chmod(755))
          .pipe(gulp.dest('./fs/usr/bin/'));

    var copyLd = gulp.src('src/ld.js')
          .pipe(rename(function(path) { path.extname = ''; }))
          .pipe(chmod(755))
          .pipe(gulp.dest('./fs/usr/bin/'));

    return merge(copyKernel, copyNode, copyBin, copyLd);
});

gulp.task('build-fs', ['build-fs-pre'], function() {

    var copyDash1 = gulp.src('src/dash.js')
          .pipe(rename(function(path) { path.basename = 'sh'; path.extname = ''; }))
          .pipe(gulp.dest('./fs/bin/'));

    // FIXME: we should just look in 2 dirs on the path
    var copyDash2 = gulp.src('src/dash.js')
          .pipe(rename(function(path) { path.basename = 'sh'; path.extname = ''; }))
          .pipe(gulp.dest('./fs/usr/bin/'));

    return merge(copyDash1, copyDash2);
});

// finally, we create an index.json file so that BrowserFS can see
// everything in our nice hierarchy
gulp.task('index-fs', ['build-fs'], function() {
    return run('./xhrfs-index fs').exec()
        .pipe(rename(function(path) {
            path.basename = 'index';
            path.extname = '.json';
        }))
        .pipe(gulp.dest('./fs'));
});

gulp.task('copy-dash', [], function() {

});

gulp.task('index-benchfs', [], function() {
    return run('./xhrfs-index benchfs').exec()
        .pipe(rename(function(path) {
            path.basename = 'index';
            path.extname = '.json';
        }))
        .pipe(gulp.dest('./benchfs'));
});

gulp.task('build-test', ['index-fs'], function() {
    return gulp.src('test/*.ts')
        .pipe(ts(project())).js
        .pipe(gulp.dest('test'));
});

gulp.task('build-bench', ['index-benchfs'], function() {
    return gulp.src('bench/*.ts')
        .pipe(ts(project())).js
        .pipe(gulp.dest('bench'));
});

// we compile all our tests into a single javascript file because
// that is how browserify likes to work :\
gulp.task('dist-test', ['build-test'], function() {
    var testMain = './test/test-all.js';
    var b = browserify({
        entries: [testMain],
        builtins: false,
        insertGlobalVars: globalVars,
    });
    b.exclude('webworker-threads');

    return b.bundle()
        .pipe(source(testMain))
        .pipe(buffer())
        .on('error', gutil.log)
        .pipe(gulp.dest('./lib-dist/'));
});

gulp.task('dist-bench', ['build-bench', 'index-benchfs'], function() {
    var testMain = './bench/bench.js';
    var b = browserify({
        entries: [testMain],
        builtins: false,
        insertGlobalVars: globalVars,
    });
    b.exclude('webworker-threads');

    return b.bundle()
        .pipe(source(testMain))
        .pipe(buffer())
        .on('error', gutil.log)
        .pipe(gulp.dest('./lib-dist/'));
});

// this starts karma & rebuild everything on change
gulp.task('test-browser', ['dist-test'], function(done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: false,
        autoWatchBatchDelay: 1000,
    }, done).start();

    gulp.watch(['src/**/*.ts', 'test/*.ts'], ['dist-test']);
});

// this runs karma once, exiting gulp on completion or failure
gulp.task('bench', ['dist-bench'], function(done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        concurrency: 1,
        colors: false,
        browserNoActivityTimeout: 100000, // ms
        reporters: ['dots'],
        browsers: ['Firefox', 'Chrome'],
        files: [
            'lib-dist/bench/bench.js',
            {
                pattern: 'benchfs/**/*',
                included: false,
                nocache: true,
            },
        ],
    }, done).start();
});

// this runs karma once, exiting gulp on completion or failure
gulp.task('default', ['dist-test'], function(done) {
    new karma.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        browsers: ['Firefox'],
    }, done).start();
});

// from this point on is the config for the Terminal web app, written
// using Polymer.

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

var styleTask = function (stylesPath, srcs) {
    return gulp.src(srcs.map(function(src) {
        return path.join('app', stylesPath, src);
    }))
        .pipe($.changed(stylesPath, {extension: '.css'}))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest('.tmp/' + stylesPath))
        .pipe($.cssmin())
        .pipe(gulp.dest('dist/' + stylesPath))
        .pipe($.size({title: stylesPath}));
};

var imageOptimizeTask = function (src, dest) {
    return gulp.src(src)
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(dest))
        .pipe($.size({title: 'images'}));
};

var optimizeHtmlTask = function (src, dest) {
    var assets = $.useref.assets({searchPath: ['.tmp', 'app', 'dist']});

    return gulp.src(src)
    // Replace path for vulcanized assets
        .pipe($.if('*.html', $.replace('elements/elements.html', 'elements/elements.vulcanized.html')))
        .pipe(assets)
    // Concatenate and minify JavaScript
//        .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
        .pipe($.if('*.css', $.cssmin()))
        .pipe(assets.restore())
        .pipe($.useref())
    // Minify any HTML
        .pipe($.if('*.html', $.minifyHtml({
            quotes: true,
            empty: true,
            spare: true
        })))
    // Output files
        .pipe(gulp.dest(dest))
        .pipe($.size({title: 'html'}));
};

// Compile and automatically prefix stylesheets
gulp.task('app:styles', function () {
    return styleTask('styles', ['**/*.css']);
});

gulp.task('app:elements', ['app:build', 'app:copy', 'app:styles'], function () {
    return styleTask('elements', ['**/*.css']);
});

// Optimize images
gulp.task('app:images', function () {
    return imageOptimizeTask('app/images/**/*', 'dist/images');
});

// Copy all files at the root level (app)
gulp.task('app:copy', ['index-fs'], function () {
    var app = gulp.src([
        'app/*',
        '!app/test',
        '!app/cache-config.json',
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));

    var bower = gulp.src([
        'bower_components/**/*'
    ]).pipe(gulp.dest('dist/bower_components'));

    var elements = gulp.src([
        'app/elements/**/*.html',
        'app/elements/**/*.css',
        'app/elements/**/*.js',
    ])
        .pipe(gulp.dest('dist/elements'));

    var swBootstrap = gulp.src(['bower_components/platinum-sw/bootstrap/*.js'])
        .pipe(gulp.dest('dist/elements/bootstrap'));

    var swToolbox = gulp.src(['bower_components/sw-toolbox/*.js'])
        .pipe(gulp.dest('dist/sw-toolbox'));

    var vulcanized = gulp.src(['app/elements/elements.html'])
        .pipe($.rename('elements.vulcanized.html'))
        .pipe(gulp.dest('dist/elements'));

    var fs = gulp.src(['fs/**/*'])
        .pipe(gulp.dest('dist/fs'));

    return merge(app, bower, elements, vulcanized, swBootstrap, swToolbox, fs)
        .pipe($.size({title: 'copy'}));
});

// Copy web fonts to dist
gulp.task('app:fonts', function () {
    return gulp.src(['app/fonts/**'])
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size({title: 'fonts'}));
});

// Scan your HTML for assets & optimize them
gulp.task('app:html', ['app:elements'], function () {
    return optimizeHtmlTask(
        ['app/**/*.html', '!app/{elements,test}/**/*.html'],
        'dist');
});

// Vulcanize granular configuration
gulp.task('app:vulcanize', ['app:images', 'app:fonts', 'app:html'], function () {
    var DEST_DIR = 'dist/elements';
    return gulp.src('dist/elements/elements.vulcanized.html')
        .pipe($.vulcanize({
            stripComments: true,
            inlineCss: true,
            inlineScripts: true
        }))
        .pipe(gulp.dest(DEST_DIR))
        .pipe($.size({title: 'vulcanize'}));
});

// Clean output directory
gulp.task('app:clean', function (cb) {
    del(['.tmp', 'dist'], cb);
});

gulp.task('app:build', ['index-fs'], function (cb) {
    return gulp.src([
        'app/elements/**/*.ts',
    ])
        .pipe(ts(project())).js
        .pipe(gulp.dest('app/elements'));

});

// Watch files for changes & reload
gulp.task('serve', ['app:build', 'app:styles', 'app:elements', 'app:images'], function () {
    var proxyOptions = url.parse('http://localhost:8080/api');
    proxyOptions.route = '/api';

    browserSync({
        port: 5000,
        notify: false,
        ghostMode: false,
        logPrefix: 'browsix',
        snippetOptions: {
            rule: {
                match: '<span id="browser-sync-binding"></span>',
                fn: function (snippet) {
                    return snippet;
                }
            }
        },
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: {
            baseDir: ['.tmp', 'app'],
            routes: {
                '/bower_components': 'bower_components',
                '/fs': 'fs',
                '/benchfs': 'benchfs',
            },
            middleware: [proxy(proxyOptions)],
        }
    });

    gulp.watch(['src/kernel/*.ts'], ['dist-kernel', reload]);
    gulp.watch(['app/**/*.html'], reload);
    gulp.watch(['app/styles/**/*.css'], ['app:styles', reload]);
    gulp.watch(['app/elements/**/*.css'], ['app:elements', reload]);
    gulp.watch(['app/{scripts,elements}/**/*.ts'], ['app:build']);
    gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['build:dist'], function () {
    browserSync({
        port: 5001,
        notify: false,
        logPrefix: 'browsix',
        snippetOptions: {
            rule: {
                match: '<span id="browser-sync-binding"></span>',
                fn: function (snippet) {
                    return snippet;
                }
            }
        },
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: 'dist',
        middleware: [ historyApiFallback() ]
    });
});

// Build production files, the default task
gulp.task('build:dist', ['app:vulcanize']);
