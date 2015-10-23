/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);
	let pflag = false;
	if (args.length && args[0] === '-p') {
		pflag = true;
		args = args.slice(1);
	}

	let code = 0;
	let completed = 0;
	function finished(): void {
		completed++;
		if (completed === args.length)
			process.exit(code);
	}

	// use map instead of a for loop so that we easily get
	// the tuple of (path, i) on each iteration.
	args.map(function(path: string, i: number): void {
		fs.mkdir(path, (err: any) => {
			console.log('making path');
			if (err && pflag) {
				// TODO: this is where we should check
				// if path has multiple components,
				// and if it does, attempt to create
				// each component.  For now just error
				// out.
				//process.stderr.write(err.message + '\n', finished);
				//return;
				let subdirs = path.split('/');
				console.log(subdirs);
				let subpath = '';
				for (let j = 0; j < subdirs.length; j++) {
					subpath += subdirs[j] + '/';
					fs.stat(subpath, function(oerr: any, stats: fs.Stats): void {
						// this never runs
						console.log("I never print");
						if (oerr) {
							console.log("ERRR");
							fs.mkdir(path, (ooerr: any) => {
								// too much fail. no more try.
								process.stderr.write(ooerr.message + '\n', finished);
								return;
							});
						}
					});
				}
			} else if (err) {
				code = 1;
				process.stderr.write(err.message + '\n', finished);
				return;
			}
			finished();
		});
	});
}

main();
