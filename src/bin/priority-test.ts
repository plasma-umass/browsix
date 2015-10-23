/// <reference path="../../typings/node/node.d.ts" />

'use strict';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/*

Offline all but CPU 0 (remove space in line below):
# for x in /sys/devices/system/cpu/cpu* /online; do   echo 0 >"$x"; done

On linux, with only one CPU online, we expect to see something like
this:

MBP 04:35:00 (master) [bpowers@vyse project-1]$ fs/usr/bin/priority-test fs/usr/bin/cpu-intensive-program && echo $?
97018a9fb40f38b8e052f07d14bafa6abf9d8c98
16d81169eeeb957a35103c2f44ef652ab62e7215
7a198c8037dbd5ea322dc3b033d2b3a0b0306d71
5e901f0aac64d7024a4ea6f089625e3ac22d992d
7736a0bdca37f65abfa192c2165a7f094503baff
f92f9158ea9a7464a1d29e1ecfbd05e73ea4df73
12447c1211a0fb9503168763baf36bd998cf53ba
1e41caeefe8b16428d1f28331e95058b089810bc
f248644492c4c816822bb61ce32da5823ba00cdd
0c1bdaec866fb9956bc2b2a07a56f1bff5f410d9
bf4d24776ac4d1ebb621002e3765d51c4723f0e9
26836fd30f57bb6c1ef4765f027b7fe3e4542e1b
04d929230665e6d4817ac71d367e575341535572
b203b2b847dc2d6fbc280c6fa09cc35a1ce256e8
4209f7d1dcf8307851e741dc285ae69c52c7174b
d7a0f77724ebda5c40257adeb9006cd06360d279
cab71414ca5ea0c7a949e7fc15584175138f1f2c
596a89be8bdea4225904f9ac250b468d7c9385a2
195c083e44e67c9301aa248eaa7a8ea6e19850df
8b01dbb1457edd2f28ce741c1e4d42078d5210c7
8b01dbb1457edd2f28ce741c1e4d42078d5210c7
fast done
97018a9fb40f38b8e052f07d14bafa6abf9d8c98
16d81169eeeb957a35103c2f44ef652ab62e7215
7a198c8037dbd5ea322dc3b033d2b3a0b0306d71
5e901f0aac64d7024a4ea6f089625e3ac22d992d
7736a0bdca37f65abfa192c2165a7f094503baff
f92f9158ea9a7464a1d29e1ecfbd05e73ea4df73
12447c1211a0fb9503168763baf36bd998cf53ba
1e41caeefe8b16428d1f28331e95058b089810bc
f248644492c4c816822bb61ce32da5823ba00cdd
0c1bdaec866fb9956bc2b2a07a56f1bff5f410d9
bf4d24776ac4d1ebb621002e3765d51c4723f0e9
26836fd30f57bb6c1ef4765f027b7fe3e4542e1b
04d929230665e6d4817ac71d367e575341535572
b203b2b847dc2d6fbc280c6fa09cc35a1ce256e8
4209f7d1dcf8307851e741dc285ae69c52c7174b
d7a0f77724ebda5c40257adeb9006cd06360d279
cab71414ca5ea0c7a949e7fc15584175138f1f2c
596a89be8bdea4225904f9ac250b468d7c9385a2
195c083e44e67c9301aa248eaa7a8ea6e19850df
8b01dbb1457edd2f28ce741c1e4d42078d5210c7
8b01dbb1457edd2f28ce741c1e4d42078d5210c7
slow done
0


*/

function main(): void {
	'use strict';

	let pathToScript = process.argv[1];
	let args = process.argv.slice(2);

	if (!args.length) {
		let usage = 'usage: ' + path.basename(pathToScript) + ' CMD\n';
		process.stderr.write(usage, (err: any) => {
			process.exit(1);
		});
		return;
	}

	let opts = {
		// pass our stdin, stdout, stderr to the child
		stdio: [0, 1, 2],
	};

	let ordering: string[] = [];
	function finished(name: string): void {
		ordering.push(name);
		if (ordering.length === 2) {
			let err = ordering[0] === 'fast' ? 0 : 1;
			if (err) {
				process.stderr.write('fast finished last\n', () => {
					process.exit(err);
				});
				return;
			}
			process.exit(err);
		}
	}

	let slowChild = child_process.spawn(args[0], ['20', '20000'], opts);
	slowChild.on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
			finished('slow');
		});
	});
	slowChild.on('exit', (code: number) => {
		process.stderr.write('slow done\n', () => {
			finished('slow');
		});
	});

	let fastChild = child_process.spawn(args[0], ['0', '20000'], opts);
	fastChild.on('error', (err: any) => {
		process.stderr.write('error: ' + err, () => {
			finished('fast');
		});
	});
	fastChild.on('exit', (code: number) => {
		process.stderr.write('fast done\n', () => {
			finished('fast');
		});
	});
}

main();
