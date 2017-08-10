'use strict';

import * as fs from 'fs';


// TODO: column alignment
function formatStats(path: string, stats: fs.Stats): string {
	/* tslint:disable indent */
	return `  File: ‘${path}’
  Size: ${stats.size}      	Blocks: ${stats.blocks}          IO Block: ${stats.blksize}
Device: ${stats.dev}	Inode: ${stats.ino}  Links: ${stats.nlink}
Access: ${stats.mode}  Uid: ${stats.uid}   Gid: ${stats.gid}
Access: ${stats.atime}
Modify: ${stats.mtime}
Change: ${stats.ctime}
 Birth: ${stats.birthtime}
`;
	/* tslint:enable indent */
}

function stat(inputs: string[], output: NodeJS.WritableStream, code: number): void {
	'use strict';

	if (!inputs || !inputs.length) {
		process.exit(code);
		return;
	}

	let current = inputs[0];
	inputs = inputs.slice(1);

	if (!current) {
		// use setTimeout to avoid a deep stack as well as
		// cooperatively yield
		setTimeout(stat, 0, inputs, output, code);
		return;
	}

	fs.stat(current, function(err: any, stats: fs.Stats): void {
		if (err) {
			process.stderr.write('ERROR: ' + err, writeCompleted);
			return;
		}
		output.write(formatStats(current, stats), writeCompleted);

		function writeCompleted(): void {
			setTimeout(stat, 0, inputs, output, code);
		}
	});
}

function main(): void {
	'use strict';

	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);

	if (!args.length) {
		process.stderr.write(pathToScript + ': missing operand\n', () => {
			process.exit(1);
		});
		return;
	}

	setTimeout(stat, 0, args, process.stdout, 0);
}

main();
