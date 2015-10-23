/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as fs from 'fs';
import * as path from 'path';

// NOTE: THE FOLLOWING FUNCTION WAS ADOPTED FROM https://gist.github.com/tkihira/2367067

let frmdir = function(dir: string): void {
	fs.readdir(dir, function (err, files): void {
		console.log("dir: " + dir);
		let filename: string;
		for (let i = 0; i < files.length; i++) {
			filename = path.join(dir, files[i]);
			console.log(filename);
			fs.stat(dir, function(oerr: any, stats: fs.Stats): void {
				console.log(filename + " !isFile: " + !stats.isFile());
				if (filename === "." || filename === "..") {
					// pass these files
					console.log(".");
				} else if (!stats.isFile()) {
					// rmdir recursively
					console.log("recurse on dir: " + filename);
					frmdir(filename);
				} else {
					// rm fiilename
					console.log("removing file: " + filename);
					fs.unlink(filename);
				}
			});
		}
		fs.rmdir(dir);
	});
};

function main(): void {
	'use strict';

	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);

	// exit code to use - if we fail to open an input file it gets
	// set to 1 below.
	let code = 0;

	let now: Date = new Date();
	let opened = 0;

	function finished(): void {
		opened++;
		if (opened === args.length)
			process.exit(code);
	}
	interface Opts {
		force: boolean;
		recursive: boolean;
	}
	let opts = {force: false, recursive: false};
	while (args.length && args[0][0] === '-') {
		for (let i = 1; i < args[0].length; i++) {
			switch (args[0][i]) {
			case "f":
				opts.force = true;
				break;
			case "r":
				opts.recursive = true;
				break;
			default:
				process.stderr.write(pathToScript + ': unknown flag ' + args[0], () => {
					process.exit(1);
				});
				return;
			}
		}
		args.shift();
	}
	if (!args.length) {
		// no args?  no bueno!
		process.stderr.write('usage:\n rm [-f | -r] FILE\n');
		process.exit(1);
	} else {
		// use map instead of a for loop so that we easily get
		// the tuple of (path, i) on each iteration.
		args.map(function(path: string, i: number): void {
			fs.stat(path, function(err: any, stats: fs.Stats): void {
				if (err) {
					if (!opts.force) {
						code = 1;
						process.stderr.write(path + " No such file or directory.\n");
					}
				} else {
					if (stats.isFile()) {
						fs.unlink(path, (oerr): void => {
							if (oerr) {
								code = 1;
								process.stderr.write(oerr.message);
							}
							finished();
						});
					}
					else {
						if (opts.recursive) {
							frmdir(path);
						}
						else if (!opts.force) {
							code = 1;
							process.stderr.write(path + " is a directory.\n");
						}

					}
				}
			});
		});
	}
}

main();
