#!/usr/bin/env node

/// <reference path="../../typings/node/nodexxx.d.ts" />

'use strict';

import * as fs from 'fs';

function concat(inputs: NodeJS.ReadableStream[], output: NodeJS.WritableStream): void {
	'use strict';

	if (!inputs.length)
		return;

	let current = inputs[0];
	inputs = inputs.slice(1);

	if (!current) {
		setTimeout(concat, 0, inputs, output);
		return;
	}

	current.setEncoding('utf-8');

	current.on('readable', function(): void {
		let buf = current.read();
		if (buf !== null)
			output.write(buf);
	});

	current.on('end', function(): void {
		setTimeout(concat, 0, inputs, output);
	});
}

function main(): void {
	'use strict';

	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);

	if (!args.length) {
		setTimeout(concat, 0, [process.stdin], process.stdout);
	} else {
		let files: NodeJS.ReadableStream[] = [];
		let opened = 0;
		args.map(function(path, i): void {
			if (path === '-') {
				files[i] = process.stdin;
				// if we've opened all of the files, pipe them to
				// stdout.
				if (++opened === args.length) {
					setTimeout(concat, 0, files, process.stdout);
				}
				return;
			}
			fs.open(path, 'r', function(err, fd): void {
				files[i] = fs.createReadStream(path, {fd: fd.toString()});
				// if we've opened all of the files, pipe them to
				// stdout.
				if (++opened === args.length) {
					setTimeout(concat, 0, files, process.stdout);
				}
			});
		});
	}
}

main();
