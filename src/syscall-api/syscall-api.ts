'use strict';

import { syscallTbl } from './table';

export interface SyscallCallback {
	(response: [number, number, number]): void;
}

export function Syscall(cb: Function, trap: number): void {
	syscallTbl[trap].apply(this, arguments);
};

export var Syscall6 = Syscall;

declare var global: any;
declare var exports: any;
if (typeof window !== "undefined") { /* web page */
	(<any>window).$syscall = exports;
} else if (typeof self !== "undefined") { /* web worker */
	(<any>self).$syscall = exports;
} else if (typeof global !== "undefined") { /* Node.js */
	(<any>global).$syscall = exports;
} else { /* others (e.g. Nashorn) */
	(<any>this).$syscall = exports;
}
