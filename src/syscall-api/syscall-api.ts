'use strict';

import { Marshal, socket } from 'node-binary-marshal';
import { syscall } from '../browser-node/syscall';
import { utf8Slice } from '../browser-node/binding/buffer';


export interface SyscallCallback {
	(response: [number, number, number]): void;
}

export function Syscall(cb: Function, trap: number, ...args: any[]): void {
	let done: Function;
	console.log('syscall ' + trap);
	switch (trap) {
	case 1: // write
		done = function(err: any, len: number): void {
			cb([len, 0, err ? -1 : 0]);
		};
		args = [args[0], utf8Slice(args[1], 0, args[2]), 0, done];
		syscall.pwrite.apply(syscall, args);
		break;
	case 231: // exit_group
		syscall.exit(args[0]);
		break;
	case 41: // socket
		done = function(err: any, fd: number): void {
			cb([err ? -1 : fd, 0, err ? -1 : 0]);
		};
		args = [args[0], args[1], args[2], done];
		syscall.socket.apply(syscall, args);
		break;
	case 49: // bind
		console.log('FIXME: unmarshal');
		args = [args[0], '127.0.0.1', 8080, function(err: any): void {
			cb([err ? -1 : 0, 0, err ? -1 : 0]);
		}];
		syscall.bind.apply(syscall, args);
		break;
	case 50: // listen
		args = [args[0], args[1], function(err: any): void {
			cb([err ? -1 : 0, 0, err ? -1 : 0]);
		}];
		syscall.listen.apply(syscall, args);
		break;
	case 51: // getsockname
		console.log('TODO: getsockname');

		Marshal(args[1], {family: 2, port: 8080, addr: '127.0.0.1'}, socket.SockAddrInDef);
		args[2].$set(socket.SockAddrInDef.length);
		setTimeout(cb, 0, [0, 0, 0]);
		break;
	case 288: // accept4
		let $acceptArray = args[1];
		let $acceptLen = args[2];
		args = [args[0], function(err: any, fd: number, remoteAddr: string, remotePort: number): void {
			if (remoteAddr === 'localhost')
				remoteAddr = '127.0.0.1';
			Marshal($acceptArray, {family: 2, port: remotePort, addr: remoteAddr}, socket.SockAddrInDef);
			$acceptLen.$set(socket.SockAddrInDef.length);
			cb([err ? -1 : fd, 0, err ? -1 : 0]);
		}];
		syscall.accept.apply(syscall, args);
		break;
	case 54: // setsockopt
		console.log('FIXME: implement setsockopt');
		setTimeout(cb, 0, 0, 0, 0);
		break;
	default:
		debugger;
		setTimeout(cb, 0, [-1, 0, -1]);
	}
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
