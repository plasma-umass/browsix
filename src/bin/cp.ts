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

	let code: number = 0;
	let outstanding: number = args.length;

	function finished(): void {
		outstanding--;
		if (outstanding <= 0) {
			process.exit(code);
		}
	}

	if (!outstanding) {
		code = -1;
		log('missing file operand', finished);
		return;
	}

	if (outstanding === 1) {
		code = -1;
		log('missing destination file operand after ‘%s’', args, finished);
		return;
	}

	function onReadStreamError(err: Error): void {
		code = 1;
		log(err.message);
		this.close();
	}

	function onWriteStreamError(err: Error): void {
		code = 1;
		log(err.message);
		this.end();
	}

	function copy(src: string, dest: string): void {
		fs.stat(src, function (oerr: any, stats: fs.Stats): void {
			if (oerr) {
				code = 1;
				log(oerr.message, finished);
			} else if (stats.isFile()) {
				let rs: any = fs.createReadStream(src);
				rs.on('error', onReadStreamError);

				let ws: any = fs.createWriteStream(dest);
				ws.on('error', onWriteStreamError);
				ws.on('finish', finished);

				rs.pipe(ws);
			} else if (stats.isDirectory()) {
				code = 1;
				log('omitting directory ‘%s’', src, finished);
			} else {
				code = 1;
				log('unrecognised command', finished);
			}
		});
	}

	let dest: string = args[--outstanding];

	fs.stat(dest, function (oerr: any, stats: fs.Stats): void {
		if (dest[dest.length - 1] === '/' && (oerr || (stats && !stats.isDirectory()))) {
			code = 1;
			log("target ‘%s’ is not a directory", dest, finished);
		} else if (oerr) {
			if (outstanding === 1 && oerr.code === "ENOENT") {
				copy(args[0], dest);
			} else {
				code = 1;
				log(oerr.message, finished);
				process.exit(code);
				return;
			}
		} else if (outstanding === 1 && stats.isFile()) {
			if (args[0] !== dest) {
				copy(args[0], dest);
			} else {
				code = 1;
				log('‘%s’ and ‘%s’ are the same file', args[0], dest, finished);
			}
		} else if (stats.isDirectory()) {
			for (let i = 0, end = outstanding; i < end; i++) {
				copy(args[i], dest + '/' + args[i].split('/').pop());
			}
		} else {
			code = 1;
			log("target ‘%s’ is not a directory", dest, finished);
		}
	});
}

main();
