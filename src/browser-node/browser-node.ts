'use strict';

import { now } from './ipc';

(<any>self).onmessage = function(event: MessageEvent): void {
	'use strict';
	// FIXME: the typescript compiler complains about this usage
	// of postMessage.
	(<any>self).postMessage('');
};
console.log('booted');
