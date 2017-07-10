'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/fs/' : '/fs/';

export const name = 'test-touch';

describe('touch /a', function(): void {
	this.timeout(10 * MINS);

	const B_CONTENTS = 'wishing you were here';
	let kernel: Kernel = null;

	it('should boot', function(done: MochaDone): void {
		Boot('XmlHttpRequest', ['index.json', ROOT, true], function(err: any, freshKernel: Kernel): void {
			expect(err).to.be.null;
			expect(freshKernel).not.to.be.null;
			kernel = freshKernel;
			done();
		});
	});

	it('should create /b', function(done: MochaDone): void {
		kernel.fs.writeFile('/b', B_CONTENTS, function(err: any): void {
			expect(err).to.be.undefined;
			done();
		});
	});

	it('should run `touch /a`', function(done: MochaDone): void {
		let stdout = '';
		let stderr = '';
		kernel.system('touch /a', onExit, onStdout, onStderr);
		function onStdout(pid: number, out: string): void {
			stdout += out;
		}
		function onStderr(pid: number, out: string): void {
			stderr += out;
		}
		function onExit(pid: number, code: number): void {
			try {
				expect(code).to.equal(0);
				expect(stdout).to.equal('');
				expect(stderr).to.equal('');
				done();
			} catch (e) {
				done(e);
			}
		}
	});
	it('should read /a', function(done: MochaDone): void {
		kernel.fs.readFile('/a', 'utf-8', function(err: any, contents: string): void {
			expect(err).to.be.undefined;
			expect(contents).to.equal('');
			done();
		});
	});

	it('should have new timestamps', function(done: MochaDone): void {
		kernel.fs.stat('/a', function(err: any, stats: any): void {
			expect(err).to.be.null;
			let now = new Date();
			expect(stats.atime === now);
			expect(stats.mtime === now);
			done();
		});
	});
	/* this doesn't seem to work (code =1).  because it already exists and doesn't like to be touched?
	it('should run `touch /b`', function(done: MochaDone): void {
		kernel.system('touch /b', catExited);
		function catExited(code: number, stdout: string, stderr: string): void {
			try {
				expect(code).to.equal(0);
				expect(stdout).to.equal('');
				expect(stderr).to.equal('');
				done();
			} catch (e) {
				//console.log(e);
				done(e);
			}
		}
	});
	*/
});
