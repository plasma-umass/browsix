'use strict';

var gulp = require('gulp');
var merge = require('merge2');
var ts = require('gulp-typescript');
var lint = require('gulp-tslint');
var runSequence = require('run-sequence');
var mocha = require('gulp-mocha');

function tsPipeline(src, dst) {
    var project = ts.createProject('tsconfig.json', {
	noExternalResolve: true,
	sortOutput: true,
    });

    return function() {
	var build = gulp.src(src)
	    .pipe(ts(project));
	return merge(build.js, build.dts).pipe(gulp.dest(dst));
    }
}

function tsTask(subdir) {
    gulp.task('lint-'+subdir, function () {
	return gulp.src('src/'+subdir+'/*.ts')
	    .pipe(lint())
            .pipe(lint.report('verbose'));
    });
    gulp.task(
	'build-'+subdir, ['lint-'+subdir], tsPipeline('src/'+subdir+'/*.ts', 'lib/'+subdir));

}

tsTask('kernel');
tsTask('browser-node');

gulp.task('test', ['build-kernel', 'build-browser-node'], function() {
    return gulp.src('test/*.ts')
        .pipe(ts(project)).js
	.pipe(gulp.dest('test'))
	.pipe(mocha());
});

gulp.task('default', function(cb) {
    runSequence(['build-kernel', 'build-browser-node'], 'test', cb);
});
