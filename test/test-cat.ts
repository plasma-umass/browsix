/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />

'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const PREFIX = IS_KARMA ? '/base/' : '';

const NODE = PREFIX + 'dist/lib/browser-node/browser-node.js';
const CAT = PREFIX + 'lib/bin/cat.js';

describe('cat /a', function(): void {
	this.timeout(120000);

	const A_CONTENTS = 'contents of a';
	let kernel: Kernel = null;

	it('should boot', function(done: MochaDone): void {
		Boot('InMemory', function(err: any, freshKernel: Kernel) {
			expect(err).to.be.null;
			expect(freshKernel).not.to.be.null;
			kernel = freshKernel;
			done();
		});
	});

	it('should create /a', function(done: MochaDone): void {
		kernel.fs.writeFile('/a', A_CONTENTS, function(err: any) {
			expect(err).to.be.undefined;
			done();
		});
	});

	it('should run `cat /a`', function(): Promise<any> {
		return kernel.system(NODE + ' ' + CAT + ' /a').then(function(value: [number, string, string]) {
			let code: number = value[0];
			let stdout: string = value[1];
			let stderr: string = value[2];
			expect(code).not.to.be.null;
			expect(stdout).to.equal(A_CONTENTS);
			expect(stderr).to.equal('');
		});
	});
});
