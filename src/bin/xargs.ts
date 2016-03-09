'use strict';

import * as fs from 'fs';
import * as child_process from 'child_process';
import {format} from 'util';

let maxArgs = 1000;
let delimiter = /[\n*\s*]/;
let verbose = false;
let command = '';

function getData(): void {
	process.stdin.on('data', (chunk: Buffer) => {
		pass(chunk.toString().split(delimiter));
	});
}

function pass(data: string[]): void {

	let opts = {
		encoding: 'utf8',
		timeout: 100,
		killSignal: 'SIGTERM'
	};

	for (let i = 0; i <= data.length/maxArgs; i++) {
		let xargs: string[];
		if ((i+1)*maxArgs >= data.length) {
			xargs = data.splice(i*maxArgs);
		} else {
			xargs = data.splice(i*maxArgs, maxArgs);
		}

		let query = command.concat(' ', xargs.join(' '));

		if (verbose) {
			process.stdout.write(query.concat("\n"));
		}

		let child = child_process.exec(query, opts, (error, stdout, stderr) => {
			if (error) {
				throw error;
			}
			process.stdout.write(stdout.toString().split(/[\n*\s*]/).join(" ").concat("\n"));
		});
	}
}

function parseArgs(): void {

	let errors = 0;

	let argv = process.argv.slice(2);

	let i = 0;

	while (argv[i][0] === "-") {

		for (let j = 1; j<argv[i].length; j++) {
			let arg = argv[i][j];
			switch (arg) {
				case 'n':
					i++;
				maxArgs = parseInt(argv[i], 10);
				break;
				case 'd':
					i++;
				delimiter = new RegExp(argv[i]);
				break;
				case 't':
					verbose = true;
				break;
				default:
					process.stdout.write('unknown option "%s"', arg);
				errors++;
				break;
			}
		}
		i++;

	}
	command = argv.splice(i).join(" ");
}
parseArgs();
getData();
