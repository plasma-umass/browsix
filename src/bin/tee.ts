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
function tee(inputs: NodeJS.ReadableStream, outputs: NodeJS.WritableStream[], code: number): void {
	'use strict';

	if (!inputs) {
		process.exit(code);
		return;
	}
	//console.log("SXz");
	let current = inputs;
	//inputs = inputs.slice(1);
	if (!current) {
		// use setTimeout to avoid a deep stack as well as
		// cooperatively yield
		setTimeout(tee, 0, inputs, outputs, code);
		return;
	}

	current.on('readable', function(): void {
		let buf = current.read();
		if (buf !== null)
			for (let i = 0; i < outputs.length; i++) {
				outputs[i].write(buf);
			}
	});

	current.on('end', function(): void {
		// use setTimeout to avoid a deep stack as well as
		// cooperatively yield
		setTimeout(tee, 0, inputs, outputs, code);
	});
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
		// no args?  just copy stdin to stdout
		setTimeout(tee, 0, process.stdin, [process.stdout], code);
	} else {
		let files: NodeJS.WritableStream[] = [];
		files.push(process.stdout);
		let opened = 0;
		// use map instead of a for loop so that we easily get
		// the tuple of (path, i) on each iteration.
		args.map(function(path, i): void {
			/*if (path === '-') {
				files[i] = process.stdin;
				// if we've opened all of the files, pipe them to
				// stdout.
				if (++opened === args.length)
					setTimeout(tee, 0, files, process.stdout, code);
				return;
			}*/
			fs.open(path, 'w', function(err: any, fd: any): void {
				if (err) {
					// if we couldn't open the
					// specified file we should
					// print a message but not
					// exit early - we need to
					// process as many inputs as
					// we can.
					files[i+1] = null;
					code = 1;
					process.stderr.write(pathToScript + ': ' + err.message + '\n');
				} else {
					files[i+1] = fs.createWriteStream(path, {fd: fd});
				}
				// if we've opened all of the files,
				// pipe them to stdout.
				if (++opened === args.length)
					setTimeout(tee, 0, process.stdin, files, code);
			});
		});
	}
}

main();
