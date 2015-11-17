'use strict';

let nowFn: ()=>number;

if (typeof performance !== 'undefined') {
	nowFn = performance.now.bind(performance);
} else {
	nowFn = function(): number {
		let [sec, nanosec] = process.hrtime();
		return sec*1e3 + nanosec/1e6;
	};
}


export class Timer {

	static now(): number {
		return nowFn();
	}

	constructor() {
		(<any>console).trace('TODO: someone wants a tty');
	}

	start(): number {
		(<any>console).trace('TODO: someone wants a start');
		return 0;
	}
	stop(): number {
		(<any>console).trace('TODO: someone wants a stop');
		return 0;
	}
	close(): void {
		(<any>console).trace('TODO: someone wants a close');

	}
}
