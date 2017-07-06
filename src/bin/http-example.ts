'use strict';

import { spawn } from 'child_process';
import { connect, Socket } from 'net';
import * as http from 'http';

function main(): void {
	let serverFinished = false;
	let clientFinished = false;

	let server = spawn('usr/bin/go-hello', [], { stdio: [0, 1, 2] });
	server.on('error', (err: any) => {
		process.stderr.write('error: ' + err + '\n', () => {
			serverFinished = true;
			if (clientFinished)
				return process.exit(0);
		});
	});
	server.on('exit', () => {
		serverFinished = true;
		if (clientFinished)
			return process.exit(0);
	});

	setTimeout(client, 5000);
	function client(): void {
		let options = {
			host: 'localhost',
			port: 8080,
			path: '/',
		};

		function callback(response: http.IncomingMessage): void {
			let str = '';

			response.on('data', (chunk: string) => {
				str += chunk;
				process.stdout.write('http client got: ' + chunk + '\n');
				setTimeout(process.exit, 0);
			});

			//response.on('end', () => {
			//	process.stdout.write('http client got: ' + str + '\n');
			//});
		}

		http.request(options, callback).end();
	}
}

main();
