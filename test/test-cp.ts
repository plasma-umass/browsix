'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';
import {equal} from "assert";

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

describe('cp /a', function(): void {
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

    it('should throw error when file doesn\'t and destination is missing `cp /a`', function(done: MochaDone): void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a', onExit, onStdout, onStderr);
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
                expect(stderr).to.equal('cp: missing destination file operand after ‘/a’\n');
                done();
            } catch (e) {
                done(e);
            }
        }
    });

    it('should create /a', function(done: MochaDone): void {
        kernel.fs.writeFile('/a', A_CONTENTS, function(err: any): void {
            expect(err).to.be.undefined;
            done();
        });
    });

    it('should throw error when file exist but destination is missing `cp /a`', function (done:MochaDone):void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a', onExit, onStdout, onStderr);
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
                expect(stderr).to.equal('cp: missing destination file operand after ‘/a’\n');
                done();
            } catch (e) {
                done(e);
            }
        }
    });
});

describe('cp /a /b', function(): void {
    this.timeout(10 * MINS);

    const A_CONTENTS = 'contents of a';
    const B_CONTENTS = 'contents of b';
    let kernel: Kernel = null;

    it('should boot', function(done: MochaDone): void {
        Boot('XmlHttpRequest', ['index.json', ROOT, true], function(err: any, freshKernel: Kernel): void {
            expect(err).to.be.null;
            expect(freshKernel).not.to.be.null;
            kernel = freshKernel;
            done();
        });
    });

    it('should throw error when file /a doesn\'t exist `cp /a /b`', function(done: MochaDone): void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a /b', onExit, onStdout, onStderr);
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
                expect(stderr).not.to.be.empty;
                done();
            } catch (e) {
                done(e);
            }
        }
    });

    it('should create /a', function(done: MochaDone): void {
        kernel.fs.writeFile('/a', A_CONTENTS, function(err: any): void {
            expect(err).to.be.undefined;
            done();
        });
    });

    it('should run `cp /a /b`', function (done:MochaDone):void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a /b', onExit, onStdout, onStderr);
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

    it('should have /b', function(done: MochaDone): void {
        kernel.fs.stat('/b', function(err: any, stat: any): void {
            expect(err).to.be.null;
            expect(stat).not.to.be.null;
            expect(stat.isFile()).to.be.true;
            done();
        });
    });

    it('both files should have same content', function(done: MochaDone): void {
        kernel.fs.readFile('/b', 'utf-8', function(err: any, contents: string): void {
            expect(err).to.be.undefined;
            expect(contents).to.equal(A_CONTENTS);
            done();
        });
    });

    it('should change the content of /a', function(done: MochaDone): void {
        kernel.fs.writeFile('/a', B_CONTENTS, function(err: any): void {
            expect(err).to.be.undefined;
            kernel.fs.readFile('/a', 'utf-8', function(err: any, contents: string): void {
               expect(err).to.be.undefined;
                expect(contents).to.equal(B_CONTENTS);
                done();
            });
        });
    });

    it('should run `cp /a /b` when /b exists and writable', function (done:MochaDone):void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a /b', onExit, onStdout, onStderr);
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

    it('should overwrite the contents of /b', function (done: MochaDone): void {
        kernel.fs.readFile('/b', 'utf-8', function(err: any, contents: string): void {
            expect(err).to.be.undefined;
            expect(contents).to.equal(B_CONTENTS);
            done();
        });
    });

    it('should throw error when src and dest are same `cp /a /a`', function (done:MochaDone):void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a /a', onExit, onStdout, onStderr);
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
                expect(stderr).to.equal('cp: ‘/a’ and ‘/a’ are the same file\n');
                done();
            } catch (e) {
                done(e);
            }
        }
    });

    it('should throw error when trying to copy in a directory that doesn\'t exists', function(done: MochaDone): void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a c/', onExit, onStdout, onStderr);
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
                expect(stderr).to.equal('cp: target ‘c/’ is not a directory\n');
                done();
            } catch (e) {
                done(e);
            }
        }
    });

    it('should throw error when trying to copy in a fs which is not a directory', function (done:MochaDone):void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a b/', onExit, onStdout, onStderr);
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
                expect(stderr).to.equal('cp: target ‘b/’ is not a directory\n');
                done();
            } catch (e) {
                done(e);
            }
        }
    });

    it('should create a directory c/', function (done:MochaDone):void {
        kernel.fs.mkdir('/c', function(err: any) {
            expect(err).not.to.be.undefined;
            done();
        });
    });

    it('should run `cp /a c/`', function (done:MochaDone): void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a c/', onExit, onStdout, onStderr);
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

    it('should have /c/a', function (done:MochaDone):void {
       kernel.fs.stat('/c/a', function(err: any, stat: any): void {
           expect(err).to.be.null;
           expect(stat).not.to.be.null;
           expect(stat.isFile()).to.be.true;
           done();
       });
    });

    it('contents of /c/a and /a should be same', function (done:MochaDone):void {
        kernel.fs.readFile('/c/a', 'utf-8', function(err: any, contents: string): void {
            expect(err).to.be.undefined;
            expect(contents).to.equal(B_CONTENTS);
            done();
        });
    });

    it('should throw an error when the copying in a directory that does not exists', function (done:MochaDone):void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a d/b', onExit, onStdout, onStderr);
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
                expect(stderr).not.to.be.empty;
                done();
            } catch (e) {
                done(e);
            }
        }
    });

    it('should throw an error when trying to copy a directory without -r', function (done:MochaDone): void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /c /d', onExit, onStdout, onStderr);
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
                expect(stderr).to.equal('cp: omitting directory ‘/c’\n');
                done();
            } catch (e) {
                done(e);
            }
        }
    });
});

describe('cp /a /b /c', function(): void {
    this.timeout(10 * MINS);

    const A_CONTENTS = 'contents of a';
    const B_CONTENTS = 'contents of b';
    let kernel:Kernel = null;

    it('should boot', function (done:MochaDone):void {
        Boot('XmlHttpRequest', ['index.json', ROOT, true], function (err:any, freshKernel:Kernel):void {
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

    it('should throw error when copying more than one files to non existing directory', function (done:MochaDone):void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a /b /c', onExit, onStdout, onStderr);
        function onStdout(pid:number, out:string):void {
            stdout += out;
        }

        function onStderr(pid:number, out:string):void {
            stderr += out;
        }

        function onExit(pid:number, code:number):void {
            try {
                expect(code).to.equal(1);
                expect(stdout).to.equal('');
                expect(stderr).not.to.be.empty;
                done();
            } catch (e) {
                done(e);
            }
        }
    });

    it('should create a directory c/', function (done:MochaDone):void {
        kernel.fs.mkdir('/c', function(err: any) {
            expect(err).not.to.be.undefined;
            done();
        });
    });

    it('should run `cp /a /b /c` when c is exiting directory', function (done:MochaDone):void {
        let stdout = '';
        let stderr = '';
        kernel.system('cp /a /b /c', onExit, onStdout, onStderr);
        function onStdout(pid:number, out:string):void {
            stdout += out;
        }

        function onStderr(pid:number, out:string):void {
            stderr += out;
        }

        function onExit(pid:number, code:number):void {
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

    it('should have /c/a', function(done: MochaDone): void {
        kernel.fs.stat('/c/a', function(err: any, stat: any): void {
            expect(err).to.be.null;
            expect(stat).not.to.be.null;
            expect(stat.isFile()).to.be.true;
            done();
        });
    });

    it('should have /c/b', function(done: MochaDone): void {
        kernel.fs.stat('/c/b', function(err: any, stat: any): void {
            expect(err).to.be.null;
            expect(stat).not.to.be.null;
            expect(stat.isFile()).to.be.true;
            done();
        });
    });

    it('should have /b', function(done: MochaDone): void {
        kernel.fs.stat('/b', function(err: any, stat: any): void {
            expect(err).to.be.null;
            expect(stat).not.to.be.null;
            expect(stat.isFile()).to.be.true;
            done();
        });
    });

    it('/c/a should have same content as /a', function(done: MochaDone): void {
        kernel.fs.readFile('/c/a', 'utf-8', function(err: any, contents: string): void {
            expect(err).to.be.undefined;
            expect(contents).to.equal(A_CONTENTS);
            done();
        });
    });

    it('/c/b should have same content as /b', function(done: MochaDone): void {
        kernel.fs.readFile('/c/b', 'utf-8', function(err: any, contents: string): void {
            expect(err).to.be.undefined;
            expect(contents).to.equal(B_CONTENTS);
            done();
        });
    });
});
