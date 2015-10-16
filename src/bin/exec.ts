/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);

	if (args.length < 1) {
		let usage = 'usage: ' + path.basename(pathToScript) + ' CMD [ARGS...]\n';
		process.stderr.write(usage, (err: any) => {
			process.exit(1);
		});
		return;
	}

	child_process.execFile(args[0], args.slice(1), (error: any, stdout: Buffer, stderr: Buffer) => {
		process.stdout.write(stdout, (err: any) => {
			process.stderr.write(stderr, (errInner: any) => {
				process.exit(1);
			});
		});
	});
}

main();
