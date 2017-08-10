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

function main(): void {
	let all: boolean = false;

	let [args, ok] = parseArgs(
		process.argv.slice(2), {
			'1': (): any => {}, // nop, but make sure it doesn't error out
			'l': (): any => {}, // nop, but make sure it doesn't error out
			'a': (): any => all = true,
		}
	);
	if (!ok)
		return;

	if (!args.length)
		args = ['.'];

	let code: number = 0;
	let outstanding: number = args.length;

	for (let i = 0; i < args.length; i++) {
		((path: string) => {
			fs.readdir(path, readdirFinished.bind(null, path));
		})(args[i]);
	}

	function done(): void {
		outstanding--;
		if (!outstanding)
			process.exit(code);
	}

	function readdirFinished(dir: string, err: any, files: string[]): void {
		if (err) {
			log(err.message, done);
			return;
		}
		if (!all)
			files = files.filter((f: string) => f.length && f[0] !== '.');
		process.stdout.write(files.join('\n') + '\n', 'utf-8', (werr: any) => {
			if (werr) {
				code = -1;
				log('write: %s', werr, done);
				return;
			}
			done();
		});
	}
}

main();
