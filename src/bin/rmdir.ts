'use strict';

import * as fs from 'fs';

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);

	/*if (args.length && args[0] === '-n') {
		trailingNewline = false;
		args = args.slice(1);
	}*/
	let code = 0;
	fs.rmdir(args[0], () => {
		process.exit(code);
	});
}

main();
