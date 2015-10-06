/// <reference path="../../../typings/promise.d.ts" />

'use strict';

import { syscall } from '../syscall';


export class FSReqWrap {
	oncomplete: (err: any, ...rest: any[])=>void = undefined;
	constructor() {
	}
}

export function FSInitialize() {
}

export function open(path: string, flags: string, mode: number, req: FSReqWrap): void {
	console.log('TODO: open ' + path);

	syscall.open(path, flags, mode).then(function openFinished(fd: number): void {
		if (req.oncomplete)
			req.oncomplete(null, +fd); // force FD to be an int
	});
}

export function fstat(): void {
	console.log('TODO: fstat');

}

export function read(): void {
	console.log('TODO: read');

}

export function close(): void {
	console.log('TODO: close');
}
