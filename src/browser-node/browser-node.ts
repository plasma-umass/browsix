/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/promise.d.ts" />
/// <reference path="../../node_modules/ts-stream/ts-stream.d.ts" />

'use strict';

import { now } from './ipc';
import { syscall, SyscallResponse } from './syscall';

import * as bindingBuffer from './binding/buffer';
import * as bindingUV from './binding/uv';
import * as bindingFs from './binding/fs';
import * as bindingFsEventWrap from './binding/fs_event_wrap';
import * as bindingConstants from './binding/constants';
import * as bindingContextify from './binding/contextify';

class Process {
	argv: string[];
	env: Environment;
	queue: any[] = [];
	draining: boolean = false;

	stdin: any;
	stdout: any;
	stderr: any;

	constructor(argv: string[], environ: Environment) {
		this.argv = argv;
		this.env = environ;
	}

	exit(code: number): void {
		// FIXME: we should make sure stdout and stderr are
		// flushed.
		//this.stdout.end();
		//this.stderr.end();

		// ending the above streams I think calls close() via
		// nextTick, if exit isn't called via setTimeout under
		// node it deadlock's the WebWorker-threads :\
		setTimeout(function(): void { syscall.exit(code); }, 0);
	}

	binding(name: string): any {
		switch (name) {
		case 'buffer':
			return bindingBuffer;
		case 'uv':
			return bindingUV;
		case 'fs':
			return bindingFs;
		case 'fs_event_wrap':
			return bindingFsEventWrap;
		case 'constants':
			return bindingConstants;
		case 'contextify':
			return bindingContextify;
		default:
			console.log('TODO: unimplemented binding ' + name);
		}
		return null;
	}

	// this is from acorn
	nextTick(fun: any, ...args: any[]): void {
		this.queue.push([fun, args]);
		if (!this.draining) {
			setTimeout(this.drainQueue.bind(this), 0);
		}
	}

	// this is from acorn
	private drainQueue(): void {
		if (this.draining) {
			return;
		}
		this.draining = true;
		let currentQueue: any[];
		let len = this.queue.length;
		while (len) {
			currentQueue = this.queue;
			this.queue = [];
			let i = -1;
			while (++i < len) {
				let [fn, args] = currentQueue[i];
				fn.apply(this, args);
			}
			len = this.queue.length;
		}
		this.draining = false;
	}
}
let process = new Process(undefined, {});
(<any>self).process = process;

import * as fs from './fs';

declare var thread: any;
// node-WebWorker-threads doesn't support setTimeout becuase I think
// they want me to sink into depression.
function superSadSetTimeout(cb: any, ms: any, ...args: any[]): void {
	'use strict';
	return (<any>thread).nextTick(cb.bind.apply(cb, [this].concat(args)));
}

interface Environment {
	[name: string]: string;
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

if (typeof (<any>self).setTimeout === 'undefined')
	(<any>self).setTimeout = superSadSetTimeout;


const whitelist = {
	'Array': true,
	'ArrayBuffer': true,
	'Boolean': true,
	'Date': true,
	'Event': true,
	'EventSource': true,
	'EventTarget': true,
	'Float32Array': true,
	'Float64Array': true,
	'Function': true,
	'Int8Array': true,
	'Int16Array': true,
	'Int32Array': true,
	'JSON': true,
	'Math': true,
	'NaN': true,
	'Number': true,
	'Object': true,
	'Promise': true,
	'Set': true,
	'String': true,
	'Uint8Array': true,
	'Uint8ClampedArray': true,
	'Uint16Array': true,
	'Uint32Array': true,
	'atob': true,
	'btoa': true,
	'clearInterval': true,
	'clearTimeout': true,
	'hasOwnProperty': true,
	'isFinite': true,
	'isNaN': true,
	'isPrototypeOf': true,
	'parseFloat': true,
	'parseInt': true,
	'self': true,
	'setTimeout': true,
	'setInterval': true,
	'undefined': true,
};


syscall.addEventListener('init', init.bind(this));
function init(data: SyscallResponse): void {
	'use strict';

	let args = data.args.slice(0, -1);
	let environ = data.args[data.args.length - 1];
	process.argv = args;
	process.env = environ;
	process.stdin = new fs.createReadStream('<stdin>', {fd: 0});
	process.stdout = new fs.createWriteStream('<stdout>', {fd: 1});
	process.stderr = new fs.createWriteStream('<stderr>', {fd: 2});

	let __eval = (<any>self).eval;

	for (let property in self) {
		if (!(property in whitelist)) {
			try {
				delete self[property];
			} catch (e) {
			}
		}
	}

	fs.readFile(args[1], 'utf-8', (err: any, contents: string) => {

		(<any>self).process = process;
		(<any>self).require = _require;
		try {
			__eval(contents);
		} catch (e) {
			console.log(e);
		}
	});
}
