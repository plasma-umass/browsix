'use strict';

import * as fs from 'fs';
import * as path from 'path';
import {format} from 'util';

function log(fmt: string, ...args: any[]): void {
	let cb: Function = undefined;
	if (args.length && typeof args[args.length-1] === 'function') {
		cb = args[args.length-1];
		args = args.slice(0, -1);
	}
	let prog = process.argv[1].split('/').slice(-1);
	let msg = prog + ': ' + format.apply(undefined, [fmt].concat(args)) + '\n';

	if (cb)
		process.stderr.write(msg, cb);
	else
		process.stderr.write(msg);
}

function parseArgs(args: string[], handlers: {[n: string]: Function}, argsRequired = false): [string[], boolean] {
	let ok = true;
	let positionalArgs: string[] = args.filter((arg) => arg.substring(0, 1) !== '-');
	args = args.filter((arg) => arg.substring(0, 1) === '-');

	let errs = 0;
	function done(): void {
		errs--;
		if (!errs)
			process.exit(1);
	}
	function error(...args: any[]): void {
		errs++;
		ok = false;
		// apply the arguments we've been given to log, and
		// append our own callback.
		log.apply(this, args.concat([done]));
	}
	function usage(): void {
		errs++;
		let prog = process.argv[1].split('/').slice(-1);
		let flags = Object.keys(handlers).concat(['h']).sort().join('');
		let msg = format('usage: %s [-%s] ARGS\n', prog, flags);
		process.stderr.write(msg, done);
	}

	outer:
	for (let i = 0; i < args.length; i++) {
		let argList = args[i].slice(1);
		if (argList.length && argList[0] === '-') {
			error('unknown option "%s"', args[i]);
			continue;
		}
		for (let j = 0; j < argList.length; j++) {
			let arg = argList[j];
			if (handlers[arg]) {
				handlers[arg]();
			} else if (arg === 'h') {
				ok = false;
				break outer;
			} else {
				error('invalid option "%s"', arg);
			}
		}
	}

	if (!ok || (argsRequired && positionalArgs.length === 0)) usage();

	return [positionalArgs, ok];
}

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
		return;
	}

	// FIXME: this is a hack to work around a bug in OverlayFS (I
	// think) preventing `rm -rf /` from working - it causes all
	// subsequent unlinks to fail.
	if (files[i] === '.deletedFiles.log') {
		i++;
	}

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

function main(): void {
	'use strict';

	let argv = process.argv;
	let pathToScript = argv[1];

	let force = false;
	let recursive = false;

	let code = 0;
	let completed = 0;

	let [args, ok] = parseArgs(
		process.argv.slice(2),
		{
			'r': (): any => recursive = true,
			'f': (): any => force = true,
		},
		true
	);

	function finished(): void {
		completed++;
		if (completed === args.length)
			process.exit(code);
	}

	// use map instead of a for loop so that we easily get
	// the tuple of (path, i) on each iteration.
	args.map(function(path: string, i: number): void {
		fs.stat(path, function(err: any, stats: fs.Stats): void {
			if (err) {
				if (!force) {
					code = 1;
					log('%s', err, finished);
				} else {
					finished();
				}
				return;
			}

			if (stats.isFile()) {
				fs.unlink(path, (oerr): void => {
					if (oerr) {
						code = 1;
						log('unlink: %s', oerr, finished);
					} else {
						finished();
					}
				});
			} else {
				if (recursive) {
					frmdir(path, (oerr) => {
						if (oerr) {
							code = 1;
							log('frmdir: %s', oerr, finished);
						} else {
							finished();
						}
						return;
					});
				} else {
					code = 1;
					log("cannot remove '%s':  Is a directory", path, finished);
				}
			}
		});
	});
}

main();
