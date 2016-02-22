/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';
import {format} from 'util';

interface ArgHandlers {
	[n: string]: Function;
}

function log(fmt: string, ...args: any[]): void {
	let cb: Function = undefined;
	if (args.length && typeof args[args.length-1] === 'function') {
		cb = args[args.length-1];
		args = args.slice(0, -1);
	}
	let pathToScript = process.argv[1];
	let msg = format.apply(undefined, [fmt].concat(args));
	let err = format('%s: %s\n', pathToScript, msg);

	if (cb)
		process.stderr.write(err, cb);
	else
		process.stderr.write(err);
}

function parseArgs(args: string[], handlers: ArgHandlers): [string[], boolean] {
	let positionalArgs: string[] = [];
	let ok = true;

	for (let i = 0; i < args.length; i++) {
		if (args[i].substring(0, 1) !== '-') {
			positionalArgs.push(args[i]);
			continue;
		}

		// all args are a single-character long
		let argList = args[i].slice(1);
		if (argList.length && argList[0] === '-') {
			log('unknown option "%s"', args[i]);
			ok = false;
			continue;
		}
		for (let j = 0; j < argList.length; j++) {
			let arg = argList[j];
			let handler = handlers[arg];
			if (handler) {
				handler();
			} else {
				log('invalid option "%s"', arg);
				ok = false;
			}
		}
	}

	return [positionalArgs, ok];
}

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];

	let trailingNewline: boolean = true;

	let [args, ok] = parseArgs(
		process.argv.slice(2),
		{
			'n': (): any => trailingNewline = false,
		}
	);

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
		process.stdout.write(files.join('\n') + '\n', 'utf-8', (werr: any) => {
			if (werr) {
				code = -1;
				log('write: %s', werr.message, done);
				return;
			}
			done();
		});
	}
}

main();
