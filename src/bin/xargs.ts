/**
 * @author flat1101 ( Romans Volosatovs, r.volosatovs@student.tue.nl)
 * Took xargs(GNU findutils) 4.6.0 as an example
 * Options implemented: [nsdtr, a(partly)]
 */

/**
 * TODO:
 * 1. Error handling
 * 2. Proper help()
 * 3. Opts: [aEeIiLlPpx] 
 * 4. --help/-h
 * 5. Fix the ordering of output
 */
'use strict';

import * as fs from 'fs';
import * as child_process from 'child_process';
import {format} from 'util';

/**
 * Initialisation of default values
 */
let maxArgs = 1000;
let maxChars = 10000;
let delimiter = /[\n*\s*]/;
let verbose = false;
let checkEmpty = false;
let fileToRead = '';
let command = 'echo';
let code = 0;

/** 
 * Reads data from stdin or file, depending on '-a' flag
 * Calls pass() with a string[] of values
 */
function getData(): void {
	if (fileToRead === '') {
		process.stdin.on('data', (chunk: Buffer) => {
			pass(chunk.toString().split(delimiter));
		});
	} else {
		fs.readFile(fileToRead, (err: any, data: Buffer) => {
			if (err) throw err;
			pass(data.toString().split(delimiter));
		});
	}
}

/**
 * Displays usage, help and exits
 */
function help(): void {
	let usage = "Usage: xargs [OPTION]...COMMAND [INITIAL-ARGS]...";
	process.stderr.write(usage, (err: any) => {
		process.exit(1);
	});
}

/**
 * Takes string[] of arguments, formats and passes to the COMMAND
 * Writes to process.stdout
 */
function pass(data: string[]): void {

	let queries: string[] = [];

	let opts = {
		encoding: 'utf8',
		timeout: 100,
		killSignal: 'SIGTERM'
	};

	if (checkEmpty && data.length === 0) {
		process.exit(1);
	}

	let i = 0;
	let newQuery = true;
	let argsAdded = 0;

	while (data.length > 0) {
		if (newQuery) {
			queries.push(command);
			newQuery = false;
			argsAdded = 0;
		}
		if (argsAdded < maxArgs && queries[i].length + 1 + data[0].length < maxChars)	{
			queries[i] = queries[i].concat(" ", data.shift());
			argsAdded++;
		} else if (data[0].length > maxChars) {
			process.stderr.write("argument line too long \n");
			process.exit(1);
		} else if (command.length + 1 > maxChars) {
			process.stderr.write("cannot fit single argument within argument list size limit \n");
			process.exit(1);
		} else {
			i++;
			newQuery = true;
		}
	}

	for (let i = queries.length-1; i >= 0; i--) {

		if (verbose) {
			process.stdout.write(queries[i].concat("\n"));
		}

		let child = child_process.exec(queries[i], opts, (error, stdout, stderr) => {
			if (error) {
				throw error;
			}
			process.stdout.write(stdout.toString().split(/[\n*\s*]/).join(" ").concat("\n"));
		});
	}
}

/**
 * Parses arguments of the 'xargs' function
 * sets global variables according to the flags
 */
function parseArgs(): void {

	let err = 0;

	let argv = process.argv.slice(2);

	let i = 0;

	while (i < argv.length && argv[i][0] === "-") {

		groupParse:
			for (let j = 1; j<argv[i].length; j++) {
			let arg = argv[i][j];
			switch (arg) {
				case 'n':
					if (argv[i].length > j+1) {
					maxArgs = parseInt(argv[i].slice(j+1), 10);
				} else {
					i++;
					maxArgs = parseInt(argv[i], 10);
				}
				break groupParse;
				case 's':
					if (argv[i].length > j+1) {
					maxChars = parseInt(argv[i].slice(j+1), 10);
				} else {
					i++;
					maxChars = parseInt(argv[i], 10);
				}
				break groupParse;
				case 'd':
					if (argv[i].length > j+1) {
					delimiter = new RegExp(argv[i].slice(j+1));
				} else {
					i++;
					delimiter = new RegExp(argv[i]);
				}
				break groupParse;
				case 'a':
					if (argv[i].length > j+1) {
					fileToRead = argv[i].slice(j+1);
				} else {
					i++;
					fileToRead = argv[i];
				}
				break groupParse;
				case 't':
					verbose = true;
				break;
				case 'r':
					checkEmpty = true;
				break;
				default:
					process.stdout.write('unknown option '.concat(arg, '\n'));
				err++;
				break;
			}
		}
		i++;

	}
	if (err === 0) {
		if (i < argv.length) {
			command = argv.splice(i).join(" ");
		}
	} else {
		process.exit(1);
	}
}

parseArgs();
getData();
