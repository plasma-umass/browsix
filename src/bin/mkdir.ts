/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);
	let pflag = false;
	if (args.length && args[0] === '-p') {
		pflag = true;
		args = args.slice(1);
	}
	let code = 0;
	let path: string;
	for (let i = 0; i < args.length; i ++) {
		path = args[i];
		if (pflag) {
		}
		else {
			fs.stat(path, function(err: any, stats: fs.Stats): void {
				if (err) {
					// path doesn't exist.  mkdir!
					fs.mkdir(path, (oerr) => {
						if (oerr) {
							code = 1;
							process.stderr.write(oerr.message);
							process.exit(code);
						}
					});
				}
				else {
					code = 1;
					process.stderr.write(path + " File exists\n");
				}
			});
		}
	}
}

main();
