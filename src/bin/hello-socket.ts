'use strict';

import { createServer, Socket } from 'net';

function main(): void {
	let server = createServer((socket: Socket) => {

		process.stdout.write('Connection from ' + socket.remoteAddress + '\n');
		socket.end("Hello World\n");
		setTimeout(process.exit, 0);
	});

	// Fire up the server bound to port 7000 on localhost
	server.listen(7000, 'localhost');

	// Put a friendly message on the terminal
	process.stdout.write('TCP server listening on port 7000 at localhost.\n');
}

main();
