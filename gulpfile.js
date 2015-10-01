'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
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

// each user of our tsconfig.json setup needs a different instance of
// the 'ts project', as gulp-typescript seems to use it as a dumping
// ground.
function project() {
	return ts.createProject('tsconfig.json', {
	    noExternalResolve: true,
	    sortOutput: true,
	    declaration: true,
	});
}

function tsPipeline(src, dst) {
    return function() {
	var build = gulp.src([src, 'typings/**/*.d.ts'])
	    .pipe(ts(project()));
	return merge(build.js, build.dts).pipe(gulp.dest(dst));
    }
}

function tsTask(subdir) {
    gulp.task('lint-'+subdir, function () {
	return gulp.src('src/'+subdir+'/*.ts')
	    .pipe(lint())
            .pipe(lint.report('verbose'));
    });

    gulp.task('build-'+subdir, ['lint-'+subdir], tsPipeline('src/'+subdir+'/*.ts', 'lib/'+subdir));

    gulp.task('dist-'+subdir, ['build-'+subdir], function() {
	var b = browserify({
	    entries: ['./lib/'+subdir+'/'+subdir+'.js'],
	    builtins: false,
	    ignoreMissing: true,
	    insertGlobalVars: {
		// don't do shit when seeing use of 'process'
		'process': function () { return "" },
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

tsTask('kernel');
tsTask('browser-node');
tsTask('bin');

gulp.task('test', ['dist-kernel', 'dist-browser-node', 'build-bin'], function() {
    return gulp.src('test/*.ts')
        .pipe(ts(project())).js
	.pipe(gulp.dest('test'))
	.pipe(mocha());
});

gulp.task('default', function(cb) {
    runSequence(['dist-kernel', 'dist-browser-node', 'build-bin'], 'test', cb);
});

gulp.task('serve', ['test'], function () {
    browserSync({
        port: 5000,
        notify: false,
        logPrefix: 'browsix',
        snippetOptions: {
            rule: {
                match: '<span id="browser-sync-binding"></span>',
                fn: function (snippet) { return snippet; },
            },
        },
        server: { baseDir: ['.'] },
    });

    gulp.watch(['index.html'], reload);
    gulp.watch(['src/**/*.ts'], ['test', reload]);
});
