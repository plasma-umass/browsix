'use strict';

import * as fs from 'fs';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import * as readline from 'readline';

let path: string = "/srv/big1.txt";
let textFile: string = "";

function main(): void {
	let server = createServer((req: IncomingMessage, resp: ServerResponse)=> {
		resp.writeHead(200, {"Content-Type": "text/plain"});
		resp.write(textFile);
		resp.end();
	});

	// Fire up the server bound to port 7000 on localhost
	server.listen(7000, '128.0.0.1');

	// Put a friendly message on the terminal
	process.stdout.write('TCP server listening on port 7000 at 128.0.0.1\n');
}

function readFile(): void {
	fs.open(path, 'r', function(err: any, fd: any): void {
		if (err) {
			/*
			* Unable to read /srv/big1.txt
			*/
			code = 1;
			log(err.message);
		} else {
			let file: any = undefined;
			file = fs.createReadStream(path, {fd: fd});
			file.on('readable', function(): void {
				let rl = readline.createInterface({
					input: file,
					output: null
				});
				rl.on('line', (line: string) => {
					textFile += line + "\n";
				});
			});
			// once we are done reading the file, start the server
			file.on('end', function(): void {
				main();
			});
		}
	});
}

readFile();
