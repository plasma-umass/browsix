/// <reference path="../typings/index.d.ts" />
/// <reference path="../typings/globals/chai/index.d.ts" />
/// <reference path="../typings/globals/mocha/index.d.ts" />

'use strict';

import * as chai from 'chai';
import { Boot, Kernel } from '../lib/kernel/kernel';

const expect = chai.expect;

const MINS = 60 * 1000; // milliseconds

const IS_KARMA = typeof window !== 'undefined' && typeof (<any>window).__karma__ !== 'undefined';
const ROOT = IS_KARMA ? '/base/benchfs/' : '/benchfs/';

const N = 25;

// from https://stackoverflow.com/questions/2400935/browser-detection-in-javascript
const userAgent = (function(){
	var ua = navigator.userAgent;
	var tem: any;
	var M: RegExpMatchArray | any[] = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+(\.\d+)*)/i) || [];

	if (/trident/i.test(M[1])) {
		tem =  /\brv[ :]+(\d+)/g.exec(ua) || [];
		return 'IE ' + (tem[1] || '');
	}

	if (M[1] === 'Chrome') {
		tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
		if (tem !== null)
			return tem.slice(1).join(' ').replace('OPR', 'Opera');
	}

	M = M[2] ? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];

	if ((tem = ua.match(/version\/(\d+)/i)) !== null)
		M.splice(1, 1, tem[1]);

	return M.join('-');
})();

function log(...args: string[]): void {
	console.log(userAgent + '\t' + args.join('\t'));
}

function nullOut(pid: number, out: string): void {}


const BENCHMARKS = [
	// {
	// 	name: 'lat_syscall_getpid',
	// 	cmd: 'lat_syscall %d getpid',
	// },
	// {
	// 	name: 'lat_fslayer',
	// 	cmd: 'lat_fslayer %d',
	// },
	// {
	// 	name: 'lat_fs_create_1024',
	// 	cmd: 'lat_fs %d create 1024 /tmp',
	// },
	{
		name: 'lat_tcp_localhost',
		cmd: 'lat_tcp %d 127.0.0.1',
		remote_cmd: 'lat_tcp 0 -s',
	},
	// {
	// 	name: 'lat_proc_null_static',
	// 	cmd: 'lat_proc %d null static',
	// },
	// {
	// 	name: 'lat_pipe',
	// 	cmd: 'lat_pipe %d',
	// },
];

let kernel: Kernel = null;

function describeBenchmark(benchmark: any): void {
	let iterations: number = NaN;


	if (benchmark.remote_cmd) {
		it(benchmark.name + ' server-task', function(done: MochaDone): void {
			kernel.once('port:3962', () => { done(); });
			kernel.system(benchmark.remote_cmd, onExit, nullOut, nullOut);
			function onExit(pid: number, code: number): void {}
		});
	}

	it(benchmark.name + ' calibrate', function(done: MochaDone): void {
		let cmd = benchmark.cmd.replace('%d', 0);
		let stdout: string = '';

		kernel.system(cmd, onExit, onStdout, nullOut);
		function onStdout(pid: number, out: string): void {
			stdout += out;
		}
		function onExit(pid: number, code: number): void {
			iterations = parseInt(stdout, 10);

			expect(iterations).not.to.be.NaN;
			done();

			log(benchmark.name, cmd, 'conf', iterations + ' iterations');
		}
	});

	it(benchmark.name + ' run ' + iterations + ' times', function(done: MochaDone): void {
		let cmd = benchmark.cmd.replace('%d', iterations);
		let run = 0;

		let stdout: string = '';

		kernel.system(cmd, onExit, onStdout, nullOut);
		function onStdout(pid: number, out: string): void {
			stdout += out;
		}
		function onExit(pid: number, code: number): void {
			expect(stdout).not.to.be.empty;
			log(benchmark.name, cmd, 'run', stdout.trim());

			stdout = '';
			run++;
			if (run < N) {
				kernel.system(cmd, onExit, onStdout, nullOut);
			} else {
				done();
			}
		}
	});
}

describe('syscall', function(): void {
	this.timeout(10 * MINS);

	it('should boot', function(done: MochaDone): void {
		Boot(
			'XmlHttpRequest',
			['index.json', ROOT, true],
			(err: any, freshKernel: Kernel): void => {
				expect(err).to.be.null;
				expect(freshKernel).not.to.be.null;
				kernel = freshKernel;
				done();
			});
	});

	for (let i = 0; i < BENCHMARKS.length; i++) {
		describeBenchmark(BENCHMARKS[i]);
	}
});
