'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/fs/' : '/fs/';

export const name = 'test-cat';

describe('rm /a', function(): void {
	this.timeout(10 * MINS);

	const A_CONTENTS = 'contents of a';
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

	it('should run `rm /a`', function(done: MochaDone): void {
		let stdout: string = '';
		let stderr: string = '';
		kernel.system('/usr/bin/rm /a', onExit, onStdout, onStderr);
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
	it('should remove /a', function(done: MochaDone): void {
		kernel.fs.stat('/a', function(err: any): void {
			expect(err);
			done();
		});
	});
});

describe('rm -r /a', function(): void {
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

	it('should create directories /a /a/b /a/c', function(done: MochaDone): void {
		kernel.fs.mkdir('/a', function(err: any): void {
			expect(err).to.be.undefined;
			done();
		});
		kernel.fs.mkdir('/a/b', function(err: any): void {
			expect(err).to.be.undefined;
			done();
		});
		kernel.fs.mkdir('/a/c', function(err: any): void {
			expect(err).to.be.undefined;
			done();
		});
	});

	it('should create empty files /a/1, /a/b/2, /a/b/3, /a/c/4', function(done: MochaDone): void {
		let stdout: string = '';
		let stderr: string = '';
		kernel.system('/usr/bin/touch /a/1 /a/b/2 /a/b/3 /a/c/4', onExit, onStdout, onStderr);
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

	it('should run `rm -r /a`', function(done: MochaDone): void {
		let stdout: string = '';
		let stderr: string = '';
		kernel.system('/usr/bin/rm -r /a', onExit, onStdout, onStderr);
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

	it('should remove /a', function(done: MochaDone): void {
		kernel.fs.stat('/a', function(err: any): void {
			expect(err);
			done();
		});
	});
});
