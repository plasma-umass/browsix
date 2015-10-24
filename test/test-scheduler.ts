/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />

'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/fs/' : '/fs/';

export const name = 'test-scheduler';

describe('sched test', function(): void {
	this.timeout(10 * MINS);

	let kernel: Kernel = null;

	it('should boot', function(done: MochaDone): void {
		Boot('XmlHttpRequest', ['index.json', ROOT, true], function(err: any, freshKernel: Kernel): void {
			expect(err).to.be.null;
			expect(freshKernel).not.to.be.null;
			kernel = freshKernel;
			done();
		});
	});

	// run this test 2 times
	let count: number[] = [];
	for (let i = 0; i < 2; i++)
		count.push(i);

	// use map instead of a loop so that the loop body is in its
	// own closure, providing access to the correct value of i
	// even in nested closures
	count.map((i: number) => {
		it('should run `priority-test /usr/bin/cpu-intensive-program`' + i, (done: MochaDone) => {
			kernel.system('priority-test /usr/bin/cpu-intensive-program', cmdExited);
			function cmdExited(code: number, stdout: string, stderr: string): void {
				try {
					expect(code).to.equal(0);
					done();
				} catch (e) {
					done(e);
				}
			}
		});
	});
});
