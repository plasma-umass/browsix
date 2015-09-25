'use strict';

// work under node
//if (typeof Worker === 'undefined')
//	import { Worker } from 'webworker-threads';

let worker = new Worker('lib/browser-node/entry.js');
let i = 0;
let COUNT = 10000;

let total = 0.0;
let start = performance.now();

worker.onmessage = function(event: MessageEvent): void {
	// event.data
	total += performance.now() - start;
	start = performance.now();

	if (i < COUNT) {
		worker.postMessage(performance.now());
		i++;
	} else {
		console.log('avg: ' + (total/i) + ' ms');
		console.log('(' + i + ' iterations took ' + total + ' ms)');
	}
};

console.log('starting');
worker.postMessage(performance.now());

function Boot(): void {
	'use strict';
}
