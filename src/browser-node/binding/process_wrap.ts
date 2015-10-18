'use strict';

import * as uv from './uv';

export class Process {
	constructor() {
		(<any>console).trace('TODO: someone wants a process');
	}

	spawn(): any {
		console.log('Process.spawn called');
		console.log(arguments);
		// FIXME: this tells child_process to just give up
		return uv.UV_EMFILE;
	}

	close(): void {
		console.log('Process close');
	}
}
