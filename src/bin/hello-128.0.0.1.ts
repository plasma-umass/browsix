'use strict';

import { createServer, IncomingMessage, ServerResponse } from 'http';

function main(): void {
	let s = createServer((req: IncomingMessage, resp: ServerResponse) => {
		resp.writeHead(200, {"Content-Type": "text/plain"});
		resp.end("Hello World over HTTP\n");
		setTimeout(process.exit, 0);
	});
	s.listen(8000, '128.0.0.1');
	process.stdout.write('Server running at http://128.0.0.1:8000/\n');
}

main();
