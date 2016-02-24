'use strict';

import { syscall, SyscallCallback, SyscallResponse } from '../browser-node/syscall';
import { syscallTbl } from './table';

export interface SyscallCallback {
	(response: [number, number, number]): void;
}

export function Syscall(cb: Function, trap: number): void {
	syscallTbl[trap].apply(this, arguments);
};

export var Syscall6 = Syscall;


interface Environment {
	[name: string]: string;
}

class Process {
	argv: string[];
	env: Environment;
	waiter: Function;

	constructor(argv: string[], environ: Environment) {
		this.argv = argv;
		this.env = environ;
	}

	waitArgv(cb: Function): void {
		if (this.argv === null)
			this.waiter = cb;
		else
			setTimeout(cb, 0, this.argv);
	}
}
let process = new Process(null, { /* NODE_DEBUG: 'fs' */ });

syscall.addEventListener('init', init.bind(this));
function init(data: SyscallResponse): void {
	'use strict';

	let args = data.args[0];
	let environ = data.args[1];
	args = [args[0]].concat(args);
	process.argv = args;
	process.env = environ;
	if (process.waiter) {
		let w = process.waiter;
		process.waiter = undefined;
		setTimeout(() => { w(process.argv); }, 0);
	}
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
