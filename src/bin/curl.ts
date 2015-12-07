/// <reference path="../../typings/node/node.d.ts" />

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
	}

	let url = args[0];
	let port = 80;
	let [host, path] = url.split('://')[1].split('/');
	path = '/' + path;
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

main();
