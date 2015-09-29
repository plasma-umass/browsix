'use strict';

let now: ()=>number;
if (typeof performance !== 'undefined') {
	now = performance.now.bind(performance);
} else {
	now = function(): number {
		let [sec, nanosec] = process.hrtime();
		return sec*1e3 + nanosec/1e6;
	};
}

(<any>self).onmessage = function(event: MessageEvent): void {
	'use strict';
	// FIXME: the typescript compiler complains about this usage
	// of postMessage.
	(<any>self).postMessage('');
};
console.log('booted');
