/**
 * @author flat1101 ( Romans Volosatovs, r.volosatovs@student.tue.nl)
 * Took Gentoo-packaged xargs(GNU findutils) 4.6.0 as an initial example
 * Options implemented: [dEnrstx]
 */


/**
 * TODO:
 * 1. Proper help()
 * 2. "xargs: " before the error statement
 * 3. Finish implementation of '-a' if required
 */

'use strict';

import * as fs from 'fs';
import * as child_process from 'child_process';
import {format} from 'util';

/**
 * Initialisation of default values
 */
let maxArgs = 10000;           // Argument limit
let maxChars = 4096;           // Character limit
let command = 'echo';          // COMMAND to run
let comArgs = '';              // Arguments for COMMAND
let out = '';                  // Output
let children: any[] = [];

/**
 * Option defaults
 */
let delimiter = /[\s*\n*]/; // regExp used as a delimiter
let rflag = false;          // no-run-if-empty
let tflag = false;          // verbose
let xflag = false;          // exit after -s limit is exceeded
let eflag = false;          // eof string is set
let eofStr = '';            // the eof END string(used if -e is set)
//let fileToRead = '';      // (unused) -a flag req

/**
 * Default opts for executing COMMAND
 */
let opts = {
	encoding: 'utf8',
	timeout: 100,
	killSignal: 'SIGTERM',
	stdio: [0, 1, 2]
};

function main(): void {
	parseArgs();
	getData();
	return;
}

/**
 * Reads data from stdin or file, depending on '-a' flag
 * Calls pass() with a string[] of values
 * NB! The -a flag is not implemented.
 * Can be easily substituted by /bin/cat and a pipe
 * The regExp should be modified to format files properly
 * (It is also lacking in Suckless implementation)
 */
function getData(): void {
	//process.exit(1);
	//if (fileToRead === '') {
	process.stdin.on('data', (data: Buffer) => {
		divide(data.toString('utf-8').trim().split(delimiter));
	});
	//} else {
	//	fs.readFile(fileToRead, (err: any, data: Buffer) => {
	//			if (err) throw err;
	//			console.log(data.toString().split(delimiter));
	//			pass(data.toString().split(delimiter));
	//	});
	//}
}

/**
 * Displays usage, help and exits with code 1
 */
function help(): void {
	let help = "Usage: xargs [OPTION]...COMMAND [INITIAL-ARGS]...\n";
	help += "Run COMMAND with INITIAL-ARGS and more arguments read from input\n";
	help += "\n";
	help += "Supported options: -dEnrstx \n";
	help += "Bugs to: r.volosatovs@student.tue.nl\n";
	process.stderr.write(help, () => {
		//process.stderr.write(help);
		process.exit(1);
		return;
	});
}

/**
 * Divides arguments in queries and excecutes pass()
 * @param data Array of strings containing args to pass to COMMAND
 */
function divide(data: string[]): void {

	let queries: string[][] = [];

	if (rflag && data.length === 0) {
		process.exit(0);
		return;
	}

	let i = 0;           // query number
	let argsAdded = 0;   // number of args passed to the query
	let charsAdded = 0;  // number of character passed to the query
	let newQuery = true; // start constructing a new query

	// Constructs array(string[]) of queries
	while (data.length > 0) {

		// Start filling the new query
		if (newQuery) {
			argsAdded = 0;
			charsAdded = 0;
			queries[i] = [];
			if (comArgs.length > 0) {
				queries[i].push(comArgs);
				charsAdded += comArgs.length;
			}
			newQuery = false;
		}

		// Check if an argument can be passed to a command
		if (command.length + comArgs.length + 2 > maxChars) {
			process.stderr.write("cannot fit single argument within argument list size limit\n");
			process.exit(1);
			return;

		// Check if maxChars limit is reached by appending the argument
		} else if (command.length + comArgs.length + 2 + data[0].length > maxChars) {
			process.stderr.write("argument line too long\n");
			if (xflag) {
				process.exit(1);
				return;
			}
			break;

		// Append the argument if possible
		} else if (argsAdded < maxArgs && charsAdded + 1 + data[0].length <= maxChars) {
			let arg = data.shift();
			queries[i].push(arg);
			charsAdded += arg.length + 1;
			argsAdded++;
			if (eflag) {
				if (arg === eofStr) {
					break;
				}
			}

		// Go to next query
		} else {
			i++;
			newQuery = true;
			continue;
		}
	}

	pass(0, queries);
	return;
}

/**
 * Excecutes COMMAND with formatted queries(needed amount of times)
 * Appends output of queries to 'out'
 * Writes 'out' to stdout and exits with 0 if all queries got excecuted
 * @param i index of query to run @param queries array of queries
 */
function pass(i: number, queries: string[][]): void {
	if (i >= queries.length) {
		process.stdout.write(out);
		process.exit(0);
		return;
	}

	if (tflag) {
		//out += command.concat(" ", queries[i].join(" "), "\n");
		process.stdout.write(command.concat(" ", queries[i].join(" "), "\n"));
	}

	children.push(child_process.spawn(command, queries[i], opts));

	children[i].on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
			process.exit(1);
			return;
		});
	});

	children[i].on('exit', (code: number) => {
		if (code !== 0) {
			process.stderr.write(queries[i].join(" ").concat(" exited with code ", code.toString(), "\n"), () => {
				process.exit(1);
				return;
			});
		} else {
			pass(i + 1, queries);
		}
	});
}

/**
 * Parses arguments and COMMAND
 * Sets global variables according to the given flags
 */
function parseArgs(): void {

	let argv = process.argv.slice(2);

	let i = 0;

	while (i < argv.length && argv[i][0] === "-") {
		groupParse:
		for (let j = 1; j < argv[i].length; j++) {
			let arg = argv[i][j];
			switch (arg) {
				case 'n':
					if (argv[i].length > j + 1) {
						maxArgs = parseInt(argv[i].slice(j + 1), 10);
					} else {
						i++;
						maxArgs = parseInt(argv[i], 10);
					}
					break groupParse;
				case 's':
					if (argv[i].length > j + 1) {
						maxChars = parseInt(argv[i].slice(j + 1), 10);
					} else {
						i++;
						maxChars = parseInt(argv[i], 10);
					}
					break groupParse;
				case 'd':
					if (argv[i].length > j + 1) {
						delimiter = new RegExp(argv[i].slice(j + 1));
					} else {
						i++;
						delimiter = new RegExp(argv[i]);
					}
					break groupParse;
				//case 'a':
				//	if (argv[i].length > j+1) {
				//	fileToRead = argv[i].slice(j+1);
				//} else {
				//	i++;
				//	fileToRead = argv[i];
				//}
				//break groupParse;
				case 'E':
					eflag = true;
					if (argv[i].length > j + 1) {
						eofStr = argv[i].slice(j + 1);
					} else {
						i++;
						eofStr = argv[i];
					}
					break groupParse;
				case 't':
					tflag = true;
					break;
				case 'x':
					xflag = true;
					break;
				case 'r':
					rflag = true;
					break;
				case 'h':
					help();
					break;
				default:
					process.stderr.write(format('unknown option %s\n', arg));
					help();
			}
		}
		i++;
	}
	if (i < argv.length) {
		command = argv[i];
		i++;

		if (i < argv.length) {
			comArgs = argv.splice(i).join(" ");
		}
	}
	return;
}

main();
