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

	let out = '';
	for (let i = 0; i < args.length; i++) {
		if (i !== 0)
			out += ' ';
		out += args[i];
	}

	if (trailingNewline)
		out += '\n';

	process.stdout.write(out, 'utf-8', function(err: any): void {
		let code = 0;
		if (err) {
			process.stderr.write(pathToScript + ': ' + err);
			code = -1;
		}
		process.exit(code);
	});
}

main();
