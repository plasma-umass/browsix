'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/fs/' : '/fs/';

const NODE = '/usr/bin/node';

export const name = 'test-xhrfs';

describe('find /bin/node', function(): void {
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

	it('should open /usr/bin/node', function(done: MochaDone): void {
		kernel.fs.open('/usr/bin/node', 'r', nodeOpened);
		function nodeOpened(err: any, fd: any): void {
			try {
				expect(err).to.be.null;
				expect(fd).not.to.be.null;
				done();
			} catch (e) {
				done(e);
			}
		}
	});
});
