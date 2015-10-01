/// <reference path="../../typings/node/node.d.ts" />

'use strict';

export var now: ()=>number;

if (typeof performance !== 'undefined') {
	now = performance.now.bind(performance);
} else {
	now = function(): number {
		let [sec, nanosec] = process.hrtime();
		return sec*1e3 + nanosec/1e6;
	};
}
