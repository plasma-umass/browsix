/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />

'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/fs/' : '/fs/';

export const name = 'test-tee';

describe('echo hi | tee /a', function(): void {
	this.timeout(10 * MINS);

	//const A_CONTENTS = 'contents of a';
	//const B_CONTENTS = 'wish you were here';
	let kernel: Kernel = null;

	it('should boot', function(done: MochaDone): void {
		Boot('XmlHttpRequest', ['index.json', ROOT, true], function(err: any, freshKernel: Kernel): void {
			expect(err).to.be.null;
			expect(freshKernel).not.to.be.null;
			kernel = freshKernel;
			done();
		});
	});
	/*
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
	*/

	it('should run `echo hi | tee`', function(done: MochaDone): void {
		kernel.system('echo hi | tee', catExited);
		function catExited(code: number, stdout: string, stderr: string): void {
			try {
				expect(code).to.equal(0);
				expect(stdout).to.equal('hi\n');
				expect(stderr).to.equal('');
				done();
			} catch (e) {
				done(e);
			}
		}
	});

	it('should run `echo hi | tee`', function(done: MochaDone): void {
		kernel.system('echo hi | tee /greeting', catExited);
		function catExited(code: number, stdout: string, stderr: string): void {
			try {
				expect(code).to.equal(0);
				expect(stdout).to.equal('hi\n');
				expect(stderr).to.equal('');
				done();
			} catch (e) {
				done(e);
			}
		}
	});

	it('should read /greeting', function(done: MochaDone): void {
		kernel.fs.readFile('/greeting', 'utf-8', function(err: any, contents: string): void {
			expect(err).to.be.undefined;
			expect(contents).to.equal('hi\n');
			done();
		});
	});
});
