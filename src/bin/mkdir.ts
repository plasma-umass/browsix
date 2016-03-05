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
	let completed = 0;
	function finished(): void {
		completed++;
		if (completed === args.length)
			process.exit(code);
	}

	// use map instead of a for loop so that we easily get
	// the tuple of (path, i) on each iteration.
	args.map(function(path: string, i: number): void {
		fs.mkdir(path, (err: any) => {
			console.log('making path');
			if (err && pflag) {
				let subdirs = path.split('/');
				let subpath = '';
				function mkdir_make_path (index: number): void {
					fs.mkdir(subpath, (oerr: any) => {
						if (oerr) {
							//unable to make directory.
							console.log(oerr);
						}
						else {
							if (index===subdirs.length) {
								finished();
							} else {
							subpath += subdirs[index] + '/';
							mkdir_make_path(index+1);
						}}
					});
				}
				function mkdir_path_exists (index: number): void {
					console.log('mkdir_make_path ' + subpath + ' ' + index);
					subpath += subdirs[index] + '/';
					fs.stat(subpath, function (oerr: any, stats: fs.Stats): void{
						if (oerr) {
							//check if error is 'path does not exist'
							mkdir_make_path(index+1);
						}
						else {
							//path still exists.
							mkdir_path_exists(index+1);
						}
					});
				}
				mkdir_path_exists(0);
			} else if (err) {
				code = 1;
				process.stderr.write(err.message + '\n', finished);
				return;
			}
			else {
				//mkdir without pflag finished successfully.
				finished();
			}
		});
	});
}

main();
