/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);

	if (!args.length) {
		let usage = 'usage: ' + path.basename(pathToScript) + ' CMD\n';
		process.stderr.write(usage, (err: any) => {
			process.exit(1);
		});
		return;
	}

	let opts = {
		// pass our stdin, stdout, stderr to the child
		stdio: [0, 1, 2],
	};

	let ordering: string[] = [];
	function finished(name: string): void {
		ordering.push(name);
		if (ordering.length === 2) {
			let err = ordering[0] === 'fast' ? 0 : 1;
			if (err) {
				process.stderr.write('fast finished last\n', () => {
					process.exit(err);
				});
				return;
			}
			process.exit(err);
		}
	}

	let slowChild = child_process.spawn(args[0], ['20', '20000'], opts);
	slowChild.on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
			finished('slow');
		});
	});
	slowChild.on('exit', (code: number) => {
		console.log('slow done');
		finished('slow');
	});

	let fastChild = child_process.spawn(args[0], ['0', '20000'], opts);
	fastChild.on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
			finished('fast');
		});
	});
	fastChild.on('exit', (code: number) => {
		console.log('fast done');
		finished('fast');
	});
}

main();
