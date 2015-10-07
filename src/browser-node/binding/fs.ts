/// <reference path="../../../typings/promise.d.ts" />

'use strict';

import { syscall } from '../syscall';


export class FSReqWrap {
	oncomplete: (err: any, ...rest: any[])=>void = undefined;
	context: any = undefined;

	constructor() {
	}

	complete(...args: any[]): void {
		this.oncomplete.apply(this, arguments);
	}
}

export function FSInitialize() {
}

export function open(path: string, flags: string, mode: number, req: FSReqWrap): void {
	syscall.open(path, flags, mode).then(function openFinished(fd: number): void {
		req.complete(null, +fd); // force FD to be an int
	}).catch(function openFailed(err: any) {
		req.complete(err, null);
	});
}

export function fstat(): void {
	console.log('TODO: fstat');

}

export function read(fd: number, buffer: any, offset: number, len: number, pos: number, req: FSReqWrap): void {
	if (typeof pos === 'undefined')
		pos = -1;
	syscall.pread(fd, len, pos).then(function readFinished(data: string): void {
		buffer.write(data, 0, data.length, 'utf-8');
		try {
			req.complete(null, data.length);
		} catch (e) {
			console.log('blerg');
			console.log(e);
		}
	}).catch(function readFailed(err: any) {
		req.complete(err, null);
	});
}

export function writeBuffer(fd: number, buffer: any, offset: number, len: number, pos: number, req: FSReqWrap): void {
	let str = buffer.toString('utf-8', offset, offset+len);
	syscall.pwrite(fd, str, pos).then(function writeFinished(len: number): void {
		req.complete(null, len);
	}).catch(function writeFailed(err: any) {
		req.complete(err, null);
	});
}

export function close(fd: number, req: FSReqWrap): void {
	syscall.close(fd).then(function closeFinished(status: number): void {
		req.complete(null, status);
	}).catch(function closeFailed(err: any) {
		req.complete(err, null);
	});
}
