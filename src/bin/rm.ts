/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';
import * as path from 'path';

// Originally adopted from https://gist.github.com/tkihira/2367067
// Rewritten on 25 April 2016 by Romans Volosatovs

// Recursive rm function
// Calls 'cleandir' with i=0 to empty and
// consequently remove the given 'dir'
function frmdir(dir: string, cb: (err: any) => void): void {
	fs.readdir(dir, (err, files): void => {
		if (err) {
			cb(err);
			return;
		}

		cleandir(dir, files, 0, (err) => {
			if (err) {
				cb(err);
				return;
			}

			fs.rmdir(dir, (err) => {
				if (err) {
					cb(err);
				} else {
					cb(null);
				}
			});
		});
	});
}

// Given a directory 'dir' and its contents 'files'
// Iterates over 'files' and attempts to unlink, if
// files[i] is a file, calls frmdir with files[i] otherwise
//
// A recursive implementation is needed to deal with the 
// Node.js concurrency.
// 
function cleandir(dir: string, files: string[], i:  number, cb: (err: any) => void): void {
	if (i === files.length) {
		// The directory is empty
		cb(null);
	} else {
		let filename = path.join(dir, files[i]);

		fs.stat(filename, (err: any, stats: fs.Stats): void => {
			if (err) {
				cb(err);
				return;
			}

			if (stats.isFile()) {
				fs.unlink(filename, (err) => {
					if (err) {
						cb(err);
						return;
					}

					cleandir(dir, files, i+1, cb);
				});
			} else {
				frmdir(filename, (err) => {
					if (err) {
						cb(err);
						return;
					}

					cleandir(dir, files, i+1, cb);
				});
			}
		});
	}
}

function main(): void {
	'use strict';

	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);

	// exit code to use - if we fail to open an input file it gets
	// set to 1 below.
	let code = 0;
	let force = false;
	let recursive = false;

	let opened = 0;

	function finished(): void {
		opened++;
		if (opened === args.length)
			process.exit(code);
	}

	while (args.length && args[0][0] === '-') {
		for (let i = 1; i < args[0].length; i++) {
			switch (args[0][i]) {
				case "f":
					force = true;
					break;
				case "r":
					recursive = true;
					break;
				default:
					process.stderr.write(pathToScript + ': unknown flag ' + args[0], () => {
						process.exit(1);
					});
					return;
			}
		}
		args.shift();
	}
	if (!args.length) {
		// no args?  no bueno!
		process.stderr.write('usage: rm [-f | -r] FILE\n', () => process.exit(1));
		return;
	}

	// use map instead of a for loop so that we easily get
	// the tuple of (path, i) on each iteration.
	args.map(function(path: string, i: number): void {
		fs.stat(path, function(err: any, stats: fs.Stats): void {
			if (err) {
				if (!force) {
					code = 1;
					process.stderr.write(process.argv[1] +': ' + path + ':  ' + err.message + '\n', finished);
				} else {
					finished();
				}
				return;
			}

			if (stats.isFile()) {
				fs.unlink(path, (oerr): void => {
					if (oerr) {
						code = 1;
						process.stderr.write(process.argv[1] + ': ' + oerr.message);
					}
					finished();
					return;
				});
			} else {
				if (recursive) {
					frmdir(path, (oerr) => {
						if (oerr) {
							code = 1;
							process.stderr.write(process.argv[1] + ': ' + oerr.message);
						}
						finished();
						return;
					});
				} else {
					code = 1;
					process.stderr.write(process.argv[1] + ": cannot remove '" + path + "':  Is a directory\n", () => {
						finished();
						return;
					});
				}
			}
		});
	});
}

main();
