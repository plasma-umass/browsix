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

	let opts = {
		// pass our stdin, stdout, stderr to the child
		stdio: [0, 1, 2],
	};

	let child = child_process.spawn(args[0], args.slice(1), opts);
	child.on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
			process.exit(1);
		});
	});
	child.on('exit', (code: number) => {
		process.exit(code);
	});
}

main();
