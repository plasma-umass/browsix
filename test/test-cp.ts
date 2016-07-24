/// <reference path="../typings/globals/chai/index.d.ts" />
/// <reference path="../typings/globals/mocha/index.d.ts" />

'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/fs/' : '/fs/';

export const name = 'test-cp';

describe('cp', function(): void {
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

    it('should throw error when no file operand is given `cp`', function(done: MochaDone): void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp', onExit, onStdout, onStderr);
        function onStdout(pid: number, out: string): void {
            stdout += out;
        }
        function onStderr(pid: number, out: string): void {
            stderr += out;
        }
        function onExit(pid: number, code: number): void {
            try {
                expect(code).to.equal(-1);
                expect(stdout).to.equal('');
                expect(stderr).to.equal('cp: missing file operand\n');
                done();
            } catch (e) {
                done(e);
            }
        }
    });
});
