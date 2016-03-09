'use strict';

import * as fs from 'fs';
import * as child_process from 'child_process';
import {format} from 'util';

let maxArgs = 1000;
let delimiter = /[\n*\s*]/;
let verbose = false;

//function parseArgs(args: string[], handlers: {[n: string]: Function}): [string[], boolean] {
//	let ok = true;
//	let positionalArgs: string[] = args.filter((arg) => arg.substring(0, 1) !== '-');
//	args = args.filter((arg) => arg.substring(0, 1) === '-');
//
//	let errs = 0;
//	function done(): void {
//		errs--;
//		if (!errs)
//			process.exit(1);
//	}
//	function error(...args: any[]): void {
//		errs++;
//		ok = false;
//		// apply the arguments we've been given to log, and
//		// append our own callback.
//		//log.apply(this, args.concat([done]));
//	}
//	function usage(): void {
//		errs++;
//		let prog = process.argv[1].split('/').slice(-1);
//		let flags = Object.keys(handlers).concat(['h']).sort().join('');
//		let msg = format('usage: %s [-%s] ARGS\n', prog, flags);
//		process.stderr.write(msg, done);
//	}
//
//	outer:
//		for (let i = 0; i < args.length; i++) {
//		let argList = args[i].slice(1);
//		if (argList.length && argList[0] === '-') {
//			error('unknown option "%s"', args[i]);
//			continue;
//		}
//		for (let j = 0; j < argList.length; j++) {
//			let arg = argList[j];
//			if (handlers[arg]) {
//				handlers[arg]();
//			} else if (arg === 'h') {
//				ok = false;
//				break outer;
//			} else {
//				error('invalid option "%s"', arg);
//			}
//		}
//	}
//
//	if (!ok) usage();
//
//	return [positionalArgs, ok];
//}

function getData(): void {
	process.stdin.on('data', (chunk: Buffer) => {
		pass(chunk.toString().split(delimiter));
	});
}

function pass(data: string[]): void {

	let command = parseArgs().join(" ");

	let opts = {
		encoding: 'utf8',
		timeout: 100,
		killSignal: 'SIGTERM'
	};

	for (let i = 0; i <= data.length/maxArgs; i++) {
		let xargs: string[];
		if ((i+1)*maxArgs >= data.length) {
			xargs = data.splice(i*maxArgs);
		} else {
			xargs = data.splice(i*maxArgs, maxArgs);
		}

		let query = command.concat(' ', xargs.join(' '));

		if (verbose) {
			process.stdout.write(query.concat("\n"));
		}

		let child = child_process.exec(query, opts, (error, stdout, stderr) => {
			if (error) {
				throw error;
			}
			process.stdout.write(stdout.toString().split(/[\n*\s*]/).join(" ").concat("\n"));
		});
	}
}

function parseArgs(): string[] {

	let errors = 0;

	let argv = process.argv.slice(2);

	let i = 0;

	while (argv[i][0] === "-") {

		groupParse:
			for (let j = 1; j<argv[i].length; j++) {
			let arg = argv[i][j];
			switch (arg) {
				case 'n':
					i++;
				maxArgs = parseInt(argv[i], 10);
				break;
				case 'd':
					i++;
				delimiter = new RegExp(argv[i]);
				break;
				case 't':
					verbose = true;
				break;
				default:
					process.stdout.write('unknown option "%s"', arg);
				errors++;
				break;
			}
		}
		i++;

	}
	return argv.splice(i);
}
getData();
