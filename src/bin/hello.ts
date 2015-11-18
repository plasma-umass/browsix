/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import { createServer, IncomingMessage, ServerResponse } from 'http';

function main(): void {

	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);


	// Configure our HTTP server to respond with Hello World to all requests.
	let server = createServer((request: IncomingMessage, response: ServerResponse) => {
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end("Hello World over HTTP\n");
		setTimeout(process.exit, 0);
	});

	// Listen on port 8000, IP defaults to 127.0.0.1
	server.listen(8000);

	// Put a friendly message on the terminal
	process.stdout.write('Server running at http://127.0.0.1:8000/\n');
}

main();
