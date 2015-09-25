'use strict';

var gulp = require('gulp');
var merge = require('merge2');
var ts = require('gulp-typescript');
var runSequence = require('run-sequence');
var mocha = require('gulp-mocha');

var project = ts.createProject('tsconfig.json', {
    noExternalResolve: true,
    sortOutput: true,
});

gulp.task('build-kernel', function() {
    var tsBuild = gulp.src('src/kernel/*.ts')
        .pipe(ts(project));

    return merge(tsBuild.js, tsBuild.dts)
        .pipe(gulp.dest('lib/kernel'));
});

gulp.task('build-browser-node', function() {
    var tsBuild = gulp.src('src/browser-node/*.ts')
        .pipe(ts(project));

    return merge(tsBuild.js, tsBuild.dts)
        .pipe(gulp.dest('lib/browser-node'));
});

gulp.task('test', ['build-kernel', 'build-browser-node'], function() {
    return gulp.src('test/*.ts')
        .pipe(ts(project)).js
	.pipe(gulp.dest('test'))
	.pipe(mocha());
});

gulp.task('default', function(cb) {
    runSequence(['build-kernel', 'build-browser-node'], 'test', cb);
});
