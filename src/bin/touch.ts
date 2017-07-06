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
		// no args?  no dice!
		process.stderr.write('usage:\n touch FILE\n', () => {
			process.exit(1);
		});
	} else {
		// use map instead of a for loop so that we easily get
		// the tuple of (path, i) on each iteration.
		args.map(function(path: string, i: number): void {
			fs.stat(path, function(err: any, stats: fs.Stats): void {
				if (err) {
					// if we couldn't stat the
					// specified file we should
					// create it.  Pass 'x' for
					// the CREAT flag.
					fs.open(path, 'wx', function(oerr:  any, fd: number): void {
						if (oerr) {
							// now we're in trouble and
							// we should try other files instead.
							code = 1;
							let msg = pathToScript + ': ' + oerr + '\n';
							process.stderr.write(msg, finished);
						}
						// thats it - close the sucker.
						fs.close(fd, finished);
					});
				} else {
					// file exists - just use utimes,
					// no need to open it.
					fs.utimes(path, now, now, (uerr: any) => {
						if (uerr) {
							code = 1;
							process.stderr.write('utimes: ' + uerr.message + '\n', finished);
							return;
						}
						finished();
					});
				}
			});
		});
	}
}

main();
