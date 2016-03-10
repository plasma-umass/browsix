/// <reference path="../../typings/node/node.d.ts" />

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

function parseArgs(args: string[], handlers: {[n: string]: Function}): [string[], boolean] {
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

	if (!ok) usage();

	return [positionalArgs, ok];
}

function main (): void {
	'use strict';

	let [args, ok] = parseArgs(
		process.argv.slice(2), {}
	);

	let length: number = args.length;

	if (!length) {
		let prog = process.argv[1].split('/').slice(-1);
		process.stderr.write(prog + ': ' + 'missing file operand\n');
		process.exit(-1);
	}

	let code = 0;
	let completed = 0;

	function finished(): void {
		completed++;
		if (completed === length) {
			process.exit(code);
		}
	}

	if (length === 1) {
		code = -1;
		log('missing destination file operand after ‘%s’', args, finished);
	}

	function copy(src: string, dest: string): void {
		fs.stat(src, function (oerr: any, stats: fs.Stats): void {
			if (oerr) {
				code = 1;
				log("%s", oerr, finished);
			} else if (stats.isFile()) {
				fs.createReadStream(src).pipe(fs.createWriteStream(dest));
			} else if (stats.isDirectory()) {
				code = 1;
				log('omitting directory ‘%s’', src, finished);
			} else {
				code = 1;
				log('unrecognised command', finished);
			}
		});
	}

	let dest: string = args[length - 1];

	fs.stat(dest, function (oerr: any, stats: fs.Stats): void {
		if (oerr) {
			if (length === 2 && oerr.code === "ENOENT") {
				copy(args[0], dest);
			} else {
				code = 1;
				log('fs.stat: %s', oerr, finished);
				return;
			}
		} else if (length === 2 && stats.isFile()) {
			if (args[0] !== dest) {
				copy(args[0], dest);
			} else {
				code = 1;
				log('‘%s’ and ‘%s’ are the same file', args[0], dest, finished);
			}
		} else if (stats.isDirectory()) {
			for (let i = 0, end = length - 1; i < end; i++) {
				copy(args[i], dest + '/' + args[i]);
			}
		} else {
			code = 1;
			log("target ‘%s’ is not a directory ", dest, finished);
		}
	});
}

main();
