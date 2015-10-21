/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);

	let trailingNewline: boolean = true;

	if (args.length && args[0] === '-n') {
		trailingNewline = false;
		args = args.slice(1);
	}

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
			process.stderr.write(pathToScript + ': ' + err, done);
			return;
		}
		process.stdout.write(files.join('\n') + '\n', 'utf-8', (werr: any) => {
			if (werr) {
				code = -1;
				process.stderr.write(pathToScript + ': ' + werr, done);
				return;
			}
			done();
		});
	}
}

main();
