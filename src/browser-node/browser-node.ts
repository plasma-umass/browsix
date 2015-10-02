/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/promise.d.ts" />

'use strict';

import { now } from './ipc';
import { Readable } from 'stream';
import { syscall, SyscallResponse } from './syscall';

interface OpenCallback {
	(err: any, fd: any): void;
}

class FS {
	open(path: string, flags: string, mode: number|OpenCallback, callback: OpenCallback): void {
		let nmode: number;
		if (typeof mode === 'number') {
			nmode = nmode;
		} else {
			callback = <OpenCallback>mode;
			nmode = 438; // octal 0666
		}
		syscall.open(path, flags, nmode).then(function(fd: number): void {
			callback(null, fd);
		}).catch(function(reason: any): void {
			callback(reason, null);
		});
	}

	createReadStream(path: string, options: {fd: any}): NodeJS.ReadableStream {
		console.log('TODO: createReadStream');
		return null;
	}
}
let fs = new FS();

interface Environment {
	[name: string]: string;
}

class Process {
	argv: string[];
	env: Environment;

	constructor(argv: string[], env: Environment) {
		this.argv = argv;
		this.env = env;
	}
}

function _require(moduleName: string): any {
	'use strict';

	switch (moduleName) {
	case 'fs':
		return fs;
	default:
		throw new ReferenceError('unknown module ' + moduleName);
	}
}

syscall.addEventListener('init', init.bind(this));
function init(data: SyscallResponse): void {
	'use strict';

	let args = data.args.slice(0, -1);
	let env = data.args[data.args.length - 1];
	let process = new Process(args, env);

	(<any>self).process = process;
	(<any>self).require = _require;
	(<any>self).importScripts(args[1]);
}
