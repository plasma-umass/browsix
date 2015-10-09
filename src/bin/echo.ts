/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';

// This is heavily based on the design of echo.c from sbase:
// http://git.suckless.org/sbase/tree/echo.c .

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);

	let nflag: boolean = false;

	if (args.length && args[0] === '-n') {
		nflag = true;
		args = args.slice(1);
	}

	let out = '';

	for (let i = 0; i < args.length; i++) {
		if (i !== 0)
			out += ' ';
		out += args[i];
	}

	if (!nflag)
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
