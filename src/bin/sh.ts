/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';

//
// We split on the pipe, which works since pipe is the only operator.
// 
function tokenize(statement: string, delim: string): string[] {
	'use strict';
	return statement.split(delim);
}


function parse(tokens: string[]): string[] {
	'use strict';
	let commands: string[] = [];
	let command = "";
	for (var i = 0; i < tokens.length; i++) {
		let token = tokens[i];
		if (token === operator) {
			commands.push(command.trim());
			command = "";
		} else {
			console.log(token);
			command += token + " ";
		}
	}
	commands.push(command.trim());
	return commands;
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
	console.log(tokens);

	// parse tokens into command sequence
	let parsetree = parse(tokens);
	console.log("|");

	// iterate over commands, setup pipes, and execute commands
	let stdin = process.stdin;

	// iterate over commands, waiting for them to complete, and get command exit codes

	// set statement exit code and exit
}

main();
