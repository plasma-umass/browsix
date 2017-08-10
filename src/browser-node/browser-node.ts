'use strict';

import { now } from './ipc';
import { syscall, SyscallCallback, SyscallResponse } from './syscall';

import * as bindingBuffer from './binding/buffer';
import * as bindingUV from './binding/uv';
import * as bindingFs from './binding/fs';
import * as bindingFsEventWrap from './binding/fs_event_wrap';
import * as bindingConstants from './binding/constants';
import * as bindingContextify from './binding/contextify';
import * as bindingProcessWrap from './binding/process_wrap';
import * as bindingPipeWrap from './binding/pipe_wrap';
import * as bindingTTYWrap from './binding/tty_wrap';
import * as bindingSpawnSync from './binding/spawn_sync';
import * as bindingUtil from './binding/util';
import * as bindingTimerWrap from './binding/timer_wrap';
import * as bindingCaresWrap from './binding/cares_wrap';
import * as bindingTCPWrap from './binding/tcp_wrap';
import * as bindingStreamWrap from './binding/stream_wrap';
import * as bindingUDPWrap from './binding/udp_wrap';
import * as bindingHTTPParser from './binding/http_parser';

let _bindings: {[n: string]: any} = {
	'buffer':        bindingBuffer,
	'uv':            bindingUV,
	'fs':            bindingFs,
	'http_parser':   bindingHTTPParser,
	'fs_event_wrap': bindingFsEventWrap,
	'constants':     bindingConstants,
	'contextify':    bindingContextify,
	'process_wrap':  bindingProcessWrap,
	'pipe_wrap':     bindingPipeWrap,
	'tty_wrap':      bindingTTYWrap,
	'timer_wrap':    bindingTimerWrap,
	'cares_wrap':    bindingCaresWrap,
	'tcp_wrap':      bindingTCPWrap,
	'udp_wrap':      bindingUDPWrap,
	'stream_wrap':   bindingStreamWrap,
	'spawn_sync':    bindingSpawnSync,
	'util':          bindingUtil,
};

class Process {
	argv: string[];
	env: Environment;
	pwd: string;
	queue: any[] = [];
	draining: boolean = false;

	stdin: any;
	stdout: any;
	stderr: any;

	constructor(argv: string[], environ: Environment) {
		this.argv = argv;
		this.env = environ;
	}

	init(cb: SyscallCallback): void {
		// TODO: getcwd has to be called first, as node makes
		// access to it syncronous, and with our
		// message-passing syscall interface every syscall is
		// async.  This has to be kept up to date with any
		// calls to chdir(2).
		syscall.getcwd((cwd: string) => {
			this.pwd = cwd;
			setTimeout(cb);
		});
	}

	cwd(): string {
		return this.pwd;
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
		if (!(name in _bindings)) {
			console.log('TODO: unimplemented binding ' + name);
			(<any>console).trace('TODO: unimplemented binding ' + name);
			return null;
		}

		return _bindings[name];
	}

	// this is from acorn - https://github.com/marijnh/acorn
	nextTick(fun: any, ...args: any[]): void {
		this.queue.push([fun, args]);
		if (!this.draining) {
			setTimeout(this.drainQueue.bind(this), 0);
		}
	}

	// this is from acorn - https://github.com/marijnh/acorn
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
let process = new Process(undefined, { /* NODE_DEBUG: 'fs' */ });
(<any>self).process = process;

if (typeof (<any>self).setTimeout === 'undefined')
	(<any>self).setTimeout = superSadSetTimeout;

import * as fs from './fs';
import * as buffer from './buffer';

(<any>self).Buffer = buffer.Buffer;


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

let modPipe2 = {
	pipe2: syscall.pipe2.bind(syscall, 0),
};

let modPriority = {
	get:     syscall.getpriority.bind(syscall),
	set:     syscall.setpriority.bind(syscall),
	Process: 0,
	Pgrp:    1,
	User:    2,
};

function _require(moduleName: string): any {
	'use strict';

	switch (moduleName) {
	case 'fs':
		return fs;
	case 'child_process':
		return require('./child_process');
	case 'net':
		return require('./net');
	case 'http':
		return require('./http');
	case 'path':
		return require('./path');
	case 'readline':
		return require('./readline');
	case 'util':
		return require('./util');
	case 'node-pipe2':
		return modPipe2;
	case 'node-priority':
		return modPriority;
	default:
		throw new ReferenceError('unknown module ' + moduleName);
	}
}

syscall.addEventListener('init', init.bind(this));
function init(data: SyscallResponse): void {
	'use strict';

	let args = data.args[0];
	let environ = data.args[1];
	let debug = data.args[2];

	// if the kernel wants us to, trap into the debugger to enable
	// us to step through what is going on.
	if (debug)
		debugger;

	process.argv = args;
	process.env = environ;
	// we shouldn't try to auto-close any of stdin, stdout or stderr.
	process.stdin = new fs.createReadStream('<stdin>', {fd: 0, autoClose: false});
	process.stdout = new fs.createWriteStream('<stdout>', {fd: 1, autoClose: false});
	process.stderr = new fs.createWriteStream('<stderr>', {fd: 2, autoClose: false});

	process.init(() => {
		fs.readFile(args[1], 'utf-8', (err: any, contents: string) => {
			if (err) {
				process.stderr.write('error: ' + err, () => {
					process.exit(1);
				});
				return;
			}

			// this is what node does in Module._compile.
			contents = contents.replace(/^\#\!.*/, '');

			(<any>self).process = process;
			(<any>self).require = _require;
			(self as any).exports = {};
			//try {
			(<any>self).eval(contents);
			//} catch (e) {
			//	console.log(e);
			//}
		});
	});
}
