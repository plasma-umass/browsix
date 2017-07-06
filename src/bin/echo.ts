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
	let trailingNewline: boolean = true;

	let [args, ok] = parseArgs(
		process.argv.slice(2), {
			'n': (): any => trailingNewline = false,
		}
	);
	if (!ok)
		return;

	let out = '';
	for (let i = 0; i < args.length; i++) {
		if (i !== 0)
			out += ' ';
		out += args[i];
	}

	if (trailingNewline)
		out += '\n';

	process.stdout.write(out, 'utf-8', (err: any) => {
		let code = 0;
		if (err) {
			code = -1;
			log(err.message, () => { process.exit(code); });
			return;
		}
		process.exit(code);
	});
}

main();
