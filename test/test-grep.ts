'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/fs/' : '/fs/';

export const name = 'test-grep';

describe('grep /a /b', function(): void {
	this.timeout(10 * MINS);

	const A_CONTENTS = 'the horse raced\npast the barn fell.';
	const B_CONTENTS = 'the past plate\npassed last.';
	let kernel: Kernel = null;

	it('should boot', function(done: MochaDone): void {
		Boot('XmlHttpRequest', ['index.json', ROOT, true], function(err: any, freshKernel: Kernel): void {
			expect(err).to.be.null;
			expect(freshKernel).not.to.be.null;
			kernel = freshKernel;
			done();
		});
	});

	it('should create /a', function(done: MochaDone): void {
		kernel.fs.writeFile('/a', A_CONTENTS, function(err: any): void {
			expect(err).to.be.undefined;
			done();
		});
	});

	it('should create /b', function(done: MochaDone): void {
		kernel.fs.writeFile('/b', B_CONTENTS, function(err: any): void {
			expect(err).to.be.undefined;
			done();
		});
	});

	it('should run `grep past /a /b`', function(done: MochaDone): void {
		let stdout: string = '';
		let stderr: string = '';
		kernel.system('/usr/bin/grep past /a /b', onExit, onStdout, onStderr);
		function onStdout(pid: number, out: string): void {
			stdout += out;
		}
		function onStderr(pid: number, out: string): void {
			stderr += out;
		}
		function onExit(pid: number, code: number): void {
			try {
				expect(code).to.equal(0);
				expect(stdout).to.equal('past the barn fell.\nthe past plate.');
				expect(stderr).to.equal("");
				done();
			} catch (e) {
				done(e);
			}
		}
	});
});
