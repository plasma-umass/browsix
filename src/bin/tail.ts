'use strict';

import * as fs from 'fs';
import * as readline from 'readline';

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

function tail(inputs: NodeJS.ReadableStream[], output: NodeJS.WritableStream, numlines: number, code: number): void {
	'use strict';
	if (!inputs || !inputs.length) {
		process.exit(code);
		return;
	}

	let current = inputs[0];
	inputs = inputs.slice(1);
	let n = 0;
	let outstanding = 0;
	let linebuffer: string[] = [];
	if (!current) {
		// use setTimeout to avoid a deep stack as well as
		// cooperatively yield
		setTimeout(tail, 0, inputs, output, numlines, code);
		return;
	}

	current.on('readable', function(): void {
		let rl = readline.createInterface({
			input: current,
			output: null
		});

		rl.on('line', (line: string) => {
			n++;
			linebuffer.push(line);
			if (n > numlines) {
				linebuffer.shift();
			}
		});
	});

	// FIXME: this only works for the case of a single input file
	current.on('end', function(): void {
		outstanding = linebuffer.length;
		for (let i = 0; i < linebuffer.length; i++) {
			output.write(linebuffer[i] + "\n", () => {
				outstanding--;
				if (!outstanding)
					process.exit(0);
			});
		}
		//setTimeout(tail, 0, inputs, output, numlines, code);
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
	let def_numlines = 10;
	let numlines = def_numlines;
	if (args.length && args[0] === '-n') {
		numlines = +args[1];
		args = args.slice(2);
	}
	if (!args.length) {
		// no args?  just copy default num lines from stdin to stdout
		setTimeout(tail, 0, [process.stdin], process.stdout, numlines, code);
	} else {
		let files: NodeJS.ReadableStream[] = [];
		let opened = 0;
		// use map instead of a for loop so that we easily get
		// the tuple of (path, i) on each iteration.
		args.map(function(path, i): void {
			if (path === '-') {
				files[i] = process.stdin;
				// if we've opened all of the files, pipe them to
				// stdout.
				if (++opened === args.length)
					setTimeout(tail, 0, files, process.stdout, numlines, code);
				return;
			}
			fs.open(path, 'r', function(err: any, fd: any): void {
				if (err) {
					// if we couldn't open the
					// specified file we should
					// print a message but not
					// exit early - we need to
					// process as many inputs as
					// we can.
					files[i] = null;
					code = 1;
					process.stderr.write(pathToScript + ': ' + err.message + '\n');
				} else {
					files[i] = fs.createReadStream(path, {fd: fd});
				}
				// if we've opened all of the files,
				// pipe them to stdout.
				if (++opened === args.length)
					setTimeout(tail, 0, files, process.stdout, numlines, code);
			});
		});
	}
}

main();
