'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var util = require('util');

var PluginError = gutil.PluginError;
var File = gutil.File;

var PLUGIN_NAME = 'build-runtime';

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

// based on gulp example:
// https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/dealing-with-streams.md
function addShebang(shebangText) {
    if (!shebangText)
        throw new PluginError(PLUGIN_NAME, 'Missing shebang');
    else if (typeof shebangText !== 'string')
        throw new PluginError(PLUGIN_NAME, 'shebang arg should be string containing interpreter command');

    var shebang = new Buffer(shebangText);

    var stream = through.obj(function(file, enc, cb) {
        if (file.isBuffer()) {
	    file.contents = Buffer.concat([shebang, file.contents]);
        }

        if (file.isStream()) {
            var streamer = prefixStream(shebang);
            streamer.on('error', this.emit.bind(this, 'error'));
            file.contents = file.contents.pipe(streamer);
        }

        this.push(file);
        cb();
    });

    return stream;
}

module.exports = addShebang;
