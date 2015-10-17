/// <reference path="../../typings/node/node.d.ts" />
'use strict';

import * as fs from 'fs';
import * as child_process from 'child_process';
import * as path from 'path';
import * as stream from 'stream';
import { Pipe } from '../kernel/pipe';

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
	// TODO: check if util exists on file system.
	return true;
}

function run_child(commandPath: string): void {
	'use strict';
	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);

	let opts = {
		// pass our stdin, stdout, stderr to the child
		stdio: [0, 1, 2],
	};

	let child = child_process.spawn('node', args, opts);
	child.on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
			process.exit(1);
		});
	});
	child.on('exit', (code: number) => {
		console.log("ex: " + code);
		process.exit(code);
	});
}

function remove_pid(pids: number[], pid: number): number[] {
	'use strict';
	let index = pids.indexOf(pid, 0);
	if (index !== undefined) {
		pids.splice(index, 1);
	}
	return pids;
}

function execute_child(cmd: string[], opts: Object, pids: number[], codes: number[]): child_process.ChildProcess {
	'use strict';
	let child = child_process.spawn('node', cmd, opts);
	pids.push(child.pid);
	//console.log("exec pid: " + child.pid);
	child.on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
			process.exit(1);
		});
	});

	child.on('exit', (code: number) => {
		codes.push(code);
		pids = remove_pid(pids, child.pid);
		//console.log('removing pid: ' + child.pid);
		//console.log('remainging pids: ' + pids);
		if (pids.length === 0) {
			//console.log('exiting!');
			//console.log('codes are: ' + codes);
			exit_process(codes);
		}
	});
	return child;
}

function exit_process(codes: number[]): void {
	'use strict';
	let code = 0;
	for (var i = 0; i < codes.length; i++) {
		if (codes[i] !== 0) {
			code = codes[i];
		}
	}
	process.exit(code);
}

function main(): void {
	'use strict';
	///
	// Note: assumes the statement to be executed is a _string_ in argv[2] 
	///
	// get statement
	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);
	if (args.length < 1) {
		let usage = 'usage: ' + path.basename(pathToScript) + ' CMD [ARGS...]\n';
		process.stderr.write(usage, (err: any) => {
			process.exit(1);
		});
		return;
	}
	let statement = args[0];
	//console.log(statement);

	// tokenize statement
	let tokens = tokenize(statement, "|");
	//console.log(tokens);

	// parse tokens into command sequence.
	// do path expansion for commands.
	// raise error if | is not surrounded by
	// commands.
	let utilpath = "lib/bin/";
	let parsetree: string[][] = [];
	try {
		parsetree = parse(tokens, utilpath);
	} catch (e) {
		console.log(e);
		if (e instanceof SyntaxError) {
			process.stderr.write('SyntaxError: a pipe can only be between two commands.\n');
			process.exit(1);
		}
	}
	// check if parse tree is valid
	if (! parsetree_is_valid(parsetree)) {
		process.exit(1);
	}
	// iterate over commands, setup pipes, and execute commands
	let stdin = process.stdin;
	let stderr = process.stderr;
	let pids: number[] = [];
	let codes: number[] = [];
	for (var i = 0; i < parsetree.length-1; i++) {
		let cmd = parsetree[i];
		let opts = {
			// pass our stdin, stdout, stderr to the child
			stdio: [stdin, 1, stderr],
		};
		let child = execute_child(cmd, opts, pids, codes);
		stdin = child.stdout;
	}
	// execute last command with our stdout
	let cmd = parsetree[parsetree.length-1];
	let opts = {
		// pass our stdin, stdout, stderr to the child
		stdio: [stdin, process.stdout, stderr],
	};
	let child = execute_child(cmd, opts, pids, codes);
}

main();
