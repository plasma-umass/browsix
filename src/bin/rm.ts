/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';


function main(): void {
	'use strict';

	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);

	// exit code to use - if we fail to open an input file it gets
	// set to 1 below.
	let code = 0;

	let now: Date = new Date();
	let opened = 0;

	function finished(): void {
		opened++;
		if (opened === args.length)
			process.exit(code);
	}

	if (!args.length) {
		// no args?  no bueno!
		process.stderr.write('usage:\n rm [-f | r] FILE\n');
		process.exit(1);
	} else {
		// use map instead of a for loop so that we easily get
		// the tuple of (path, i) on each iteration.
		args.map(function(path: string, i: number): void {
			fs.stat(path, function(err: any, stats: fs.Stats): void {
				if (err) {
					process.stderr.write(path + " No such file or directory.");
				} else {
					fs.unlink(path, (oerr): void => {
						if (oerr) {
							code = 1;
							process.stderr.write(err.message);
							process.exit(code);
						}
					});
				}
			});
		});
	}
}

main();
