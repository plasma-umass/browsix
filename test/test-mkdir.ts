'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/fs/' : '/fs/';

export const name = 'test-mkdir';

describe('mkdir /a', function(): void {
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

	it('should run `mkdir /a`', function(done: MochaDone): void {
		let stdout = '';
		let stderr = '';
		kernel.system('mkdir /a', onExit, onStdout, onStderr);
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
	it('should have /a', function(done: MochaDone): void {
		kernel.fs.stat('/a', function(err: any, stat: any): void {
			expect(err).to.be.null;
			expect(stat).not.to.be.null;
			done();
		});
	});

	it('should run `mkdir -p /b/c/d e  f/g/h`', function(done: MochaDone): void {
		let stdout = '';
		let stderr = '';
		kernel.system('mkdir -p /b/c/d e  f/g/h', onExit, onStdout, onStderr);
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
	it('should error out on `mkdir -p`', function(done: MochaDone): void {
		let stdout = '';
		let stderr = '';
		kernel.system('mkdir -p', onExit, onStdout, onStderr);
		function onStdout(pid: number, out: string): void {
			stdout += out;
		}
		function onStderr(pid: number, out: string): void {
			stderr += out;
		}
		function onExit(pid: number, code: number): void {
			try {
				expect(code).to.equal(1);
				expect(stdout).to.equal('');
				expect(stderr).to.equal('usage: mkdir [-hp] ARGS\n');
				done();
			} catch (e) {
				done(e);
			}
		}
	});
	it('should have /b/c/d', function(done: MochaDone): void {
		kernel.fs.stat('/b/c/d', function(err: any, stat: any): void {
			expect(err).to.be.null;
			expect(stat).not.to.be.null;
			done();
		});
	});
	it('should have a', function(done: MochaDone): void {
		kernel.fs.stat('/a', function(err: any, stat: any): void {
			expect(err).to.be.null;
			expect(stat).not.to.be.null;
			done();
		});
	});
	it('should have f/g/h', function(done: MochaDone): void {
		kernel.fs.stat('/f/g/h', function(err: any, stat: any): void {
			expect(err).to.be.null;
			expect(stat).not.to.be.null;
			done();
		});
	});


});
