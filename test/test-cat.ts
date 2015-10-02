/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />

'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const PREFIX = IS_KARMA ? '/base' : '';

const NODE = PREFIX + '/dist/lib/browser-node/browser-node.js';
const CAT = PREFIX + '/lib/bin/cat.js';

describe('cat /a', function(): void {
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

	it('should run `cat /a`', function(done: MochaDone): void {
		kernel.system(NODE + ' ' + CAT + ' /a').then(function(result: any) {
			console.log('run succeeded' + result)
			done();
		}).catch(function(reason: any) {
			console.log('run failed: ' + reason);
			expect(reason).to.be.null;
			done();
		});
	});
});

export = this;
