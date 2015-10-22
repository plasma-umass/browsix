/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';

// This is heavily based on the design of cat.c from sbase:
// http://git.suckless.org/sbase/tree/cat.c .  Seemingly more
// traditional 'node' way to do things would be to read the entire
// file contents and then dump them, but that doesn't work correctly
// for stdin where cat can read chunks at a time (think typing 'echo'
// and hitting enter) until it receives EOF.

// Recursively read each input and write it to the specified output,
// only moving onto the next input when EOF is reached.  Each file is
// a node stream object - which means that we consume it by adding 2
// event listeners, the first for when there is data available, and
// secondly for when we've reached EOF.
function stat(inputs: number[], output: NodeJS.WritableStream, code: number): void {
	'use strict';

	if (!inputs || !inputs.length) {
		process.exit(code);
		return;
	}
	for (let i = 0; i < inputs.length; i++) {
		let fd = inputs[i];
		fs.fstat(fd, function(err, stats): void {
			output.write(stats.dev + " " + stats.ino + " " + stats.mode + " " + stats.nlink + " " + " " + stats.uid + " " +
						stats.gid + " " + stats.rdev + " " + stats.size + " " + stats.atime + " " + stats.mtime + " " +
						stats.ctime + " " + stats.birthtime + " " + stats.blksize + " " + stats.blocks + "\n");
		});
	}
}

function main(): void {
	'use strict';

	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);

	// exit code to use - if we fail to open an input file it gets
	// set to 1 below.
	let code = 0;

	if (!args.length) {
		// no args?  run stat on stdin (fd=1)
		setTimeout(stat, 0, [1], process.stdout, code);
	} else {
		let fds: number[] = [];
		let opened = 0;
		// use map instead of a for loop so that we easily get
		// the tuple of (path, i) on each iteration.
		args.map(function(path, i): void {
			fs.open(path, 'r', function(err: any, fd: any): void {
				if (err) {
					// if we couldn't open the
					// specified file we should
					// print a message but not
					// exit early - we need to
					// process as many inputs as
					// we can.
					fds[i] = null;
					code = 1;
					process.stderr.write(pathToScript + ': ' + err.message + '\n');
				} else {
					fds[i] = fd;
				}
				// if we've opened all of the files,
				// pipe them to stdout.
				if (++opened === args.length)
					setTimeout(stat, 0, fds, process.stdout, code);
			});
		});
	}
}

main();
