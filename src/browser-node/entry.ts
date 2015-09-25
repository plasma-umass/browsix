'use strict';

this.onmessage = function(event: MessageEvent): void {
	'use strict';
	// FIXME: the typescript compiler complains about this usage
	// of postMessage.
	(<any>postMessage)(performance.now());
};
console.log('booted');
