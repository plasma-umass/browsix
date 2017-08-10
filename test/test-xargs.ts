'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/fs/' : '/fs/';

export const name = 'test-xargs';

describe('xargs', function(): void {
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

	it('should split on "," and pass max 2 args to COMMAND with a char limit of 13 on 1,12,123,12,1,1234', function(done: MochaDone): void {
		let stdout: string = '';
		let stderr: string = '';
		kernel.system('/usr/bin/echo 1,12,123,12,1,1234 | /usr/bin/xargs -n 2 -s 13 -d , -x', onExit, onStdout, onStderr);
		function onStdout(pid: number, out: string): void {
			stdout += out;
		}
		function onStderr(pid: number, out: string): void {
			stderr += out;
		}
		function onExit(pid: number, code: number): void {
			try {
				expect(code).to.equal(0);
				expect(stdout).to.equal('1 12\n123 12\n1 1234\n');
				expect(stderr).to.equal('');
				done();
			} catch (e) {
				done(e);
			}
		}
	});

	it('should split on "Bar" and limit the query to 8 chars, exit without printing if exceeded on "fooBarfooBarfooBarfoofooBarfoofoo"', function(done: MochaDone): void {
		let stdout: string = '';
		let stderr: string = '';
		kernel.system('/usr/bin/echo fooBarfooBarfooBarfoofooBarfoofoo | /usr/bin/xargs -s 8 -d Bar -x', onExit, onStdout, onStderr);
		function onStdout(pid: number, out: string): void {
			stdout += out;
		}
		function onStderr(pid: number, out: string): void {
			stderr += out;
		}
		function onExit(pid: number, code: number): void {
			try {
				let len = 'argument line too long\n'.length;
				expect(code).to.not.equal(0);
				expect(stdout).to.equal('');
				expect(stderr.substr(0, len)).to.equal('argument line too long\n');
				done();
			} catch (e) {
				done(e);
			}
		}
	});
	it('should be verbose and pass 2 args max on "foo bar foo"', function(done: MochaDone): void {
		let stdout: string = '';
		let stderr: string = '';
		kernel.system('/usr/bin/echo foo bar foo | /usr/bin/xargs -n 2 -t', onExit, onStdout, onStderr);
		function onStdout(pid: number, out: string): void {
			stdout += out;
		}
		function onStderr(pid: number, out: string): void {
			stderr += out;
		}
		function onExit(pid: number, code: number): void {
			try {
				expect(code).to.equal(0);
				expect(stdout).to.equal('echo foo bar\nfoo bar\necho foo\nfoo\n');
				expect(stderr).to.equal('');
				done();
			} catch (e) {
				done(e);
			}
		}
	});
});
