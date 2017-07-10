'use strict';

import { spawn } from 'child_process';
import { connect, Socket } from 'net';
import * as http from 'http';

function main(): void {
	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);

	if (!args.length) {
		process.stderr.write('usage:\n curl URL\n', () => {
			process.exit(1);
		});
		return;
	}

	let url = args[0];
	let port = 80;
	let parts = url.split('://')[1].split('/');
	let host = parts[0];
	let path = '/' + parts.slice(1).join('/');
	if (host.indexOf(':') > -1) {
		let sPort = '';
		[host, sPort] = host.split(':');
		port = parseInt(sPort, 10);
	}

	let options = {
		host: host,
		port: port,
		path: path,
	};

	function callback(response: http.IncomingMessage): void {
		let chunks: Buffer[] = [];

		response.on('data', (chunk: string) => {
			chunks.push(new Buffer(chunk));
		});

		response.on('end', () => {
			let all = Buffer.concat(chunks);
			process.stdout.write(all, () => {
				setTimeout(process.exit, 0);
			});
		});
	}

	http.request(options, callback).end();
}

main();
