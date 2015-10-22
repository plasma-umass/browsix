/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';
import * as readline from 'readline';


// Recursively read each input and write it to the specified output,
// only moving onto the next input when EOF is reached.  Each file is
// a node stream object - which means that we consume it by adding 2
// event listeners, the first for when there is data available, and
// secondly for when we've reached EOF.
function grep(pattern: string, inputs: NodeJS.ReadableStream[], output: NodeJS.WritableStream, code: number): void {
	'use strict';

	if (!inputs || !inputs.length) {
		process.exit(code);
		return;
	}

	let re = new RegExp(pattern, "g");
	let current = inputs[0];
	inputs = inputs.slice(1);

	if (!current) {
		// use setTimeout to avoid a deep stack as well as
		// cooperatively yield
		setTimeout(grep, pattern, 0, inputs, output, code);
		return;
	}

	current.on('readable', function(): void {
		let rl = readline.createInterface({
			input: current,
			output: null
		});

		rl.on('line', (line: string) => {
			//console.log(line);
			//console.log(line.match(re));
			if (line.match(re)) {
				output.write(line + '\n');
			}
		});
	});

	current.on('end', function(): void {
		// use setTimeout to avoid a deep stack as well as
		// cooperatively yield
		setTimeout(grep, 0, inputs, output, code);
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
		// no args?  no way!
		process.stderr.write('usage:\n grep PATTERN FILE\n');
	} else {
		let pattern = args[0];
		args = args.slice(1);
		if (!args.length)
			args = ['-'];
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
					setTimeout(grep, 0, pattern, files, process.stdout, code);
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
					setTimeout(grep, 0, pattern, files, process.stdout, code);
			});
		});
	}
}

main();
