/// <reference path="../../../typings/node/node.d.ts" />

'use strict';

export function _validateStdio(): void {
	(<any>console).trace('FIXME: implement _valdateStdio');
}

export function setupChannel(): void {
	(<any>console).trace('FIXME: implement setupChannel');
}

export class ChildProcess {
	constructor() {
		(<any>console).trace('FIXME: implement ChildProcess');
	}

	spawn(options: any): any {
		(<any>console).trace('FIXME: implement ChildProcess.spawn');
	}

	on(eventName: string, cb: Function): void {
		(<any>console).trace('FIXME: implement ChildProcess.on ' + eventName);
	}
}
