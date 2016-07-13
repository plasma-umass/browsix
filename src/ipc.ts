// Copyright 2016 The Browsix Authors. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

/// <reference path="../../typings/index.d.ts" />

'use strict';

export var now: () => number;

// use performance.now in the browser, and hrtime under node.
if (typeof performance !== 'undefined') {
	now = performance.now.bind(performance);
} else {
	now = function(): number {
		let [sec, nanosec] = process.hrtime();
		return sec*1e3 + nanosec/1e6;
	};
}
