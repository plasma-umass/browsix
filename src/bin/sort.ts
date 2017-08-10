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
function sort(inputs: NodeJS.ReadableStream[], output: NodeJS.WritableStream, code: number, lines: string[]): void {
	'use strict';

	if (!inputs || !inputs.length) {
		lines.sort();
		output.write(lines.join('\n') + '\n', () => {
			process.exit(code);
		});
		return;
	}

	let current = inputs[0];
	inputs = inputs.slice(1);

	if (!current) {
		// use setTimeout to avoid a deep stack as well as
		// cooperatively yield
		setTimeout(sort, 0, inputs, output, code, lines);
		return;
	}

	current.on('readable', function(): void {
		let rl = readline.createInterface({
			input: current,
			output: null
		});

		rl.on('line', (line: string) => {
			lines.push(line);
		});
	});

	current.on('end', function(): void {
		setTimeout(sort, 0, inputs, output, code, lines);
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
	let lines: string[] = [];

	if (!args.length) {
		// no args?  just sort stdin and write to stdout
		setTimeout(sort, 0, [process.stdin], process.stdout, code, lines);
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
					setTimeout(sort, 0, files, process.stdout, code, lines);
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
					setTimeout(sort, 0, files, process.stdout, code, lines);
			});
		});
	}
}

main();
