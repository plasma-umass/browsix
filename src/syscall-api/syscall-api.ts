'use strict';

import { syscall, USyscalls, SyscallCallback, SyscallResponse } from '../browser-node/syscall';
import { syscallTbl } from './table';

export interface SyscallCallback {
	(response: [number, number, number]): void;
}

// for gopherjs
export function Syscall(cb: Function, trap: number): void {
	syscallTbl[trap].apply(this, arguments);
}

// for gopherjs
export const Syscall6 = Syscall;

// for emscripten
export const internal = syscall;

interface Environment {
	[name: string]: string;
}

// one-shot event emitter.  Used to let parts of the GopherJS runtime
// block until we get an 'init' message from the Browsix kernel
// containing the argv vector and our environment.
class OnceEmitter {
	listeners: {[n: string]: Function[]};

	constructor() {
		this.listeners = {};
	}

	once(event: string, cb: Function): void {
		let cbs = this.listeners[event];
		if (!cbs)
			cbs = [cb];
		else
			cbs.push(cb);
		this.listeners[event] = cbs;
	}

	emit(event: string, ...args: any[]): void {
		let cbs = this.listeners[event];
		this.listeners[event] = [];
		if (!cbs)
			return;
		for (let i = 0; i < cbs.length; i++) {
			cbs[i].apply(null, args);
		}
	}
}

class Process extends OnceEmitter {
	argv: string[];
	env: Environment;

	constructor(argv: string[], environ: Environment) {
		super();
		this.argv = argv;
		this.env = environ;
	}

	exit(code = 0): void {
		syscall.exit(code);
	}
}
/* { NODE_DEBUG: 'fs' } */
let process = new Process(null, null);

syscall.addEventListener('init', init.bind(this));
function init(data: SyscallResponse): void {
	'use strict';

	let args = data.args[0];
	let environ = data.args[1];
	args = [args[0]].concat(args);
	process.argv = args;
	process.env = environ;
	setTimeout(() => { process.emit('ready'); }, 0);
}

declare var global: any;
declare var exports: any;
if (typeof window !== "undefined") { /* web page */
	(<any>window).$syscall = exports;
	(<any>window).process = process;
} else if (typeof self !== "undefined") { /* web worker */
	(<any>self).$syscall = exports;
	(<any>self).process = process;
} else if (typeof global !== "undefined") { /* Node.js */
	(<any>global).$syscall = exports;
	//(<any>global).process = process;
} else { /* others (e.g. Nashorn) */
	(<any>this).$syscall = exports;
	(<any>this).process = process;
}
