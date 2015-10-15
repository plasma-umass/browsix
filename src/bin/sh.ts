/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';

//
// We split on the pipe, which works since pipe is the only operator.
// 
function tokenize(statement: string, delim: string): string[] {
	'use strict';
	// strips whitespace in between commands
	return statement.split(delim);
}


function parse(tokens: string[], utildir: string): string[][] {
	'use strict';
	// each command is a list, starting with the utility,
	// followed by flags and arguments
	let commands: string[][] = [];
	for (var i = 0; i < tokens.length; i++) {
		let token = tokens[i];
		// if pipe isn't between commands, throw error
		if (! (/\S/.test(token))) {
			// string is empty or is just whitespace
			throw new SyntaxError();
		}
		// split on whitespace, don't include whitespace
		let command = token.match(/\S+/g);
		//if path to utility is not given, expand.
		if (command[0].match(/\//g) === null) {
			command[0] = utildir + command[0];
		}
		commands.push(command);
	}
	return commands;
}

function parsetree_is_valid(parsetree: string[][]): boolean {
	'use strict';
	return true;
}

function main(): void {
	'use strict';

	// get statement
	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);
	let statement = args[0];
	//console.log(statement);

	// tokenize statement
	let tokens = tokenize(statement, "|");
	//console.log(tokens);

	// parse tokens into command sequence.
	// raise error if | is not surrounded by
	// commands.
	let code = 0;
	let utilpath = "lib/bin/";
	try {
		let parsetree = parse(tokens, utilpath);
		console.log(parsetree);
	} catch (e) {
		console.log(e);
		if (e instanceof SyntaxError) {
			process.stderr.write('SyntaxError: a pipe can only be between two commands.\n');
			code = 1;
			process.exit(code);
		}
	}
	// iterate over commands, setup pipes, and execute commands
	let stdin = process.stdin;

	// iterate over commands, waiting for them to complete, and get command exit codes

	// set statement exit code and exit
}

main();
