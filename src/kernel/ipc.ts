// Copyright 2016 The Browsix Authors. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';

// use performance.now in the browser, and hrtime under node.
let nowFn: () => number;
if (typeof performance !== 'undefined') {
	nowFn = performance.now.bind(performance);
} else {
	nowFn = function(): number {
		let [sec, nanosec] = process.hrtime();
		return sec*1e3 + nanosec/1e6;
	};
}

export const now = nowFn;
