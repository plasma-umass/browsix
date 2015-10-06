/// <reference path="../../../typings/promise.d.ts" />

'use strict';

import { syscall } from '../syscall';


export class FSReqWrap {
	constructor() {
		console.log('TODO: FSReqWrap');
	}
}

export function FSInitialize() {
}

export function open(path: string, flags: string, mode: number, req: FSReqWrap): void {
	console.log('TODO: open ' + flags);

	syscall.open(path, flags, mode).then(function openFinished(): void {
		console.log('TODO: open finished');
	});
}
