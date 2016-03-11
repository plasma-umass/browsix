/**
 * @author flat1101 ( Romans Volosatovs, r.volosatovs@student.tue.nl)
 * Took Gentoo-packaged xargs(GNU findutils) 4.6.0 as an initial example
 * Options implemented: [dEnrstx]
 */

/**
 * TODO:
 * 1. Proper help()
 * 2. Find a better solution for the -t flag
 * 3. "xargs: " before the error statement
 * 4. Finish implementation of '-a' if required
 */

'use strict';

import * as fs from 'fs';
import * as child_process from 'child_process';
import {format} from 'util';

/**
 * Initialisation of default values
 */
let maxArgs = 1000;         // argument limit
let maxChars = 4096;        // character limit
let command = 'echo';       // default COMMAND to run

/**
 * Option defaults
 */
let delimiter = /[\n*\s*]/; // regExp used as a delimiter
let eflag = false;          // eof string is set
let eofStr = '';            // the eof END string
let rflag = false;          // no-run-if-empty
let tflag = false;          // verbose
let xflag = false;          // exit after -s limit is exceeded
//let fileToRead = '';      // (unused) -a flag req 

/**
 * Default opts for executing COMMAND
 */
let opts = {
	encoding: 'utf8',
	timeout: 100,
	killSignal: 'SIGTERM',
	env: {
		xargsQuery: ''
	}
};

/** 
 * Reads data from stdin or file, depending on '-a' flag
 * Calls pass() with a string[] of values
 * NB! The -a flag is not implemented.
 * Can be easily substituted by /bin/cat and a pipe
 * The regExp should be modified to format files properly
 * (It is also lacking in Suckless implementation)
 */
function getData(): void {
	//if (fileToRead === '') {
	process.stdin.on('data', (data: Buffer) => {
		pass(data.toString().split(delimiter));
	});
	//} else {
	//	fs.readFile(fileToRead, (err: any, data: Buffer) => {
	//		if (err) throw err;
	//		console.log(data.toString().split(delimiter));
	//		pass(data.toString().split(delimiter));
	//	});
	//}
}

/**
 * Displays usage, help and exits with code 1
 */
function help(): void {
	let usage = "Usage: xargs [OPTION]...COMMAND [INITIAL-ARGS]...\n";
	process.stderr.write(usage, (err: any) => {
		if (err) {
			process.stderr.write("error: "+err);
			process.exit(1);
		}
		process.stderr.write("Run COMMAND with INITIAL-ARGS and more arguments read from input\n");
		process.stderr.write("\n");
		process.stderr.write("Supported options: -dEnrstx \n");
		process.stderr.write("Bugs to: r.volosatovs@student.tue.nl\n");
		process.exit(1);
	});
}

/**
 * Takes string[] of arguments, formats and passes to the COMMAND
 * Writes to process.stdout
 */
function pass(data: string[]): void {

	let queries: string[] = [];

	if (rflag && data.length === 0) {
		process.exit(0);
	}

	let i = 0;            // query number
	let newQuery = true;  // start constructing a new query
	let argsAdded = 0;    // number of args passed to the query

	// Constructs array(string[]) of queries
	while (data.length > 0) {
		if (newQuery) {
			queries.push(command);
			newQuery = false;
			argsAdded = 0;
		}

		// Check if an argument can be passed to a command
		if (command.length + 1 > maxChars) {
			process.stderr.write("cannot fit single argument within argument list size limit\n");
			process.exit(1);
		// Check if maxChars limit is reached by appending the argument
		} else if (command.length + 1 + data[0].length > maxChars) {
			process.stderr.write("argument line too long\n");
			if (xflag) {
				process.exit(1);
			}
			break;
		// Append the argument if possible
		} else if (argsAdded < maxArgs && queries[i].length + 1 + data[0].length <= maxChars)	{
			let arg = data.shift();
			queries[i] = queries[i].concat(" ", arg);
			argsAdded++;
			if (eflag) {
				if ( arg === eofStr) {
					break;
				}
			}
		// Start a new query
		} else {
			i++;
			newQuery = true;
		}
	}

	// Runs backwards as a workaround for the output ordering
	// TODO: Find a better way to make the -t flag work
	for (let i = queries.length-1; i >= 0; i--) {
		let query = '';
		if (tflag) {
			opts.env.xargsQuery = queries[i];
			query = 'echo $xargsQuery xargsNewline && '.concat(queries[i]);
		} else {
			query = queries[i];
		}
		let child = child_process.exec(query, opts, (err, stdout, stderr) => {
			if (err) {
				process.stderr.write('error: ' + err);
				process.exit(1);
			}
			let out = stdout.toString().split(/[\n*\s*]/).join(" ").concat("\n");
			if (tflag) {
				out = out.replace(" xargsNewline ", "\n");
			}
			process.stdout.write(out);
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
				if (argv[i].length > j+1) {
					eofStr = argv[i].slice(j+1);
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
					process.stdout.write(format('unknown option %s\n', arg));
				help();
			}
		}
		i++;
	}

	if (i < argv.length) {
		command = argv.splice(i).join(" ");
	}
}

parseArgs();
getData();
