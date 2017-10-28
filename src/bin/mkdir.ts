'use strict';

import * as fs from 'fs';
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

function main (): void {
	'use strict';

	let pathToScript = process.argv[1];
	let pflag = false;

	let [args, ok] = parseArgs(
		process.argv.slice(2),
		{
			'p': (): any => pflag = true,
		},
		true
	);

	let code = 0;
	let completed = 0;

	function finished(): void {
		completed++;
		if (completed === args.length) {
			process.exit(code);
		}
	}

	function pmkdir(path: string): void {

		let subdirs = path.split('/');
		let subpath = '';

		function makePath(index: number): void {
			fs.mkdir(subpath, (oerr: any) => {
				if (oerr) {
					// unable to make directory --
					// pass finished to log to
					// ensure we eventually exit.
					log('fs.mkdir: %s', oerr, finished);
				} else {
					if (index === subdirs.length) {
						finished();
					} else {
						subpath += subdirs[index] + '/';
						makePath(index+1);
					}
				}
			});
		}

		function checkExists(index: number): void {
			subpath += subdirs[index] + '/';
			fs.stat(subpath, function (oerr: any, stats: fs.Stats): void {
				if (oerr) {
					if (oerr.code==="ENOENT")
						makePath(index+1);
				} else {
					//path still exists.
					checkExists(index+1);
				}
			});
		}

		checkExists(0);
	}

	// use map instead of a for loop so that we easily get
	// the tuple of (path, i) on each iteration.
	args.map(function(path: string, i: number): void {
		fs.mkdir(path, (err: any) => {
			if (err && pflag) {
				pmkdir(path);
			}
			else if (err) {
				code = 1;
				process.stderr.write(err.message + '\n', finished);
				return;
			}
			else {
				//mkdir without pflag finished successfully.
				finished();
			}
		});
	});
}

main();
