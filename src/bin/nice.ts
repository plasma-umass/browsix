/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as priority from 'node-priority';

function spawn(args: string[], opts: { stdio: number[]; }): void {
	let cmd = args[0];
	// FIXME: use PATH
	if (cmd.indexOf('/') === -1)
		cmd = '/usr/bin/' + cmd;
	let child = child_process.spawn(cmd, args.slice(1), opts);
	child.on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
			process.exit(1);
		});
	});
	child.on('exit', (code: number) => {
		process.exit(code);
	});
}

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);

	// no arguments? print the current priority
	if (!args.length) {
		priority.get(priority.Process, 0, (err: any, prio: number) => {
			process.stdout.write(''+prio+'\n', () => {
				process.exit(0);
			});
		});
		return;
	}

	if (args.length < 3 || args[0] !== '-n') {
		let usage = 'usage: ' + path.basename(pathToScript) + ' -n val CMD [ARGS...]\n';
		process.stderr.write(usage, (err: any) => {
			process.exit(1);
		});
		return;
	}

	let val = parseInt(args[1], 10);
	if (isNaN(val)) {
		let usage = 'usage: ' + path.basename(pathToScript) + ' -n val CMD [ARGS...]\n';
		process.stderr.write(usage, (err: any) => {
			process.exit(1);
		});
		return;
	}

	let opts = {
		// pass our stdin, stdout, stderr to the child
		stdio: [0, 1, 2],
	};

	priority.get(priority.Process, 0, (err: any, prio: number) => {
		if (err) {
			process.stderr.write('ERROR get: ' + err, () => {
				process.exit(1);
			});
			return;
		}
		val += prio;
		priority.set(priority.Process, 0, val, (serr: any) => {
			if (serr) {
				process.stderr.write('ERROR set: ' + serr, () => {
					process.exit(1);
				});
				return;
			}

			spawn(args.slice(2), opts);
		});
	});
}

main();
