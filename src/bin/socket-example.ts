/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import { spawn } from 'child_process';
import { connect, Socket } from 'net';

function main(): void {
	let serverFinished = false;
	let clientFinished = false;

	let server = spawn('usr/bin/hello-socket', [], { stdio: [0, 1, 2] });
	server.on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
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
			console.log('connected to server!');
		});
		client.on('data', (data: any) => {
			console.log('GOT: ' + data.toString().trim());
			client.end();
		});
		client.on('end', () => {
			console.log('disconnected from server');
			clientFinished = true;
			if (serverFinished)
				return process.exit(0);
		});
	}
}

main();
