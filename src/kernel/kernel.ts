'use strict';

// the following boilerplate allows us to use WebWorkers both in the
// browser and under node, and give the typescript compiler full
// information on the Worker type.  We have to disable tslint for this
// little dance, as it tries to tell us what we're doing is poor
// sportsmanship.
/* tslint:disable */
interface WorkerStatic {
	prototype: Worker;
	new(stringUrl: string): Worker;
}
declare var Worker: WorkerStatic;
if (typeof window === 'undefined' || typeof (<any>window).Worker === 'undefined')
	var Worker = <WorkerStatic>require('webworker-threads').Worker;
else
	var Worker = <WorkerStatic>(<any>window).Worker;
/* tslint:enable */

let now: ()=>number;
if (typeof performance !== 'undefined') {
	now = performance.now.bind(performance);
} else {
	now = function(): number {
		let [sec, nanosec] = process.hrtime();
		return sec*1e3 + nanosec/1e6;
	};
}

export class Kernel {
	procs: Process[];
}

const COUNT = 10000;

export class Process {
	kernel: Kernel;
	worker: Worker;

	i: number = 0;
	total: number = 0.0;
	start: number = now();

	constructor(kernel: Kernel, pathToBin: string) {
		this.kernel = kernel;
		this.worker = new Worker(pathToBin);
		this.worker.onmessage = this.messageReceived.bind(this);
		console.log('starting');
		this.worker.postMessage(now());
	}

	messageReceived(event: MessageEvent): void {
		// event.data
		this.total += now() - this.start;
		this.start = now();

		if (this.i < COUNT) {
			this.worker.postMessage(now());
			this.i++;
		} else {
			console.log('avg: ' + (this.total/this.i) + ' ms');
			console.log('(' + this.i + ' iterations took ' + this.total + ' ms)');
			this.worker.terminate();
		}
	}
}

export var proc = new Process(null, 'dist/lib/browser-node/browser-node.js');

export function Boot(): void {
	'use strict';
}
