'use strict';

import { spawn } from 'child_process';
import { connect, Socket } from 'net';

function main(): void {
	let serverFinished = false;
	let clientFinished = false;

	let server = spawn('usr/bin/hello-socket', [], { stdio: [0, 1, 2] });
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

	setTimeout(client, 1000);
	function client(): void {
		let client = connect(<any>{port: 7000}, () => {
			process.stdout.write('connected to server!\n');
		});
		client.on('data', (data: any) => {
			process.stdout.write('client got: ' + data.toString().trim() + '\n');
			clientFinished = true;
			if (serverFinished)
				return process.exit(0);
		});
	}
}

main();
