/*
 * Rusha, a JavaScript implementation of the Secure Hash Algorithm, SHA-1,
 * as defined in FIPS PUB 180-1, tuned for high performance with large inputs.
 * (http://github.com/srijs/rusha)
 *
 * Inspired by Paul Johnstons implementation (http://pajhome.org.uk/crypt/md5).
 *
 * Copyright (c) 2013 Sam Rijs (http://awesam.de).
 * Released under the terms of the MIT license as follows:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

'use strict';

import * as fs from 'fs';

/* tslint:disable */

let util = {
        getDataType: function (data: any): string {
                if (typeof data === 'string') {
			return 'string';
                }
                if (data instanceof Array) {
			return 'array';
                }
                if (typeof global !== 'undefined' && global.Buffer && global.Buffer.isBuffer(data)) {
			return 'buffer';
                }
                if (data instanceof ArrayBuffer) {
			return 'arraybuffer';
                }
                if (data.buffer instanceof ArrayBuffer) {
			return 'view';
                }
                if (data instanceof Blob) {
			return 'blob';
                }
                throw new Error('Unsupported data type.');
        }
};
// The Rusha object is a wrapper around the low-level RushaCore.
// It provides means of converting different inputs to the
// format accepted by RushaCore as well as other utility methods.
function Rusha(chunkSize: any) {
        'use strict';
        // Private object structure.
        let self$2: any = { fill: 0 };
        // Calculate the length of buffer that the sha1 routine uses
        // including the padding.
        let padlen: any = function (len: any) {
		for (len += 9; len % 64 > 0; len += 1);
		return len;
        };
        let padZeroes: any = function (bin: any, len: any) {
		for (let i = len >> 2; i < bin.length; i++)
			bin[i] = 0;
        };
        let padData: any = function (bin: any, chunkLen: any, msgLen: any) {
		bin[chunkLen >> 2] |= 128 << 24 - (chunkLen % 4 << 3);
		bin[((chunkLen >> 2) + 2 & ~15) + 14] = msgLen >> 29;
		bin[((chunkLen >> 2) + 2 & ~15) + 15] = msgLen << 3;
        };
        // Convert a binary string and write it to the heap.
        // A binary string is expected to only contain char codes < 256.
        let convStr: any = function (H8: any, H32: any, start: any, len: any, off: any) {
		let str = this, i: any, om = off % 4, lm = len % 4, j = len - lm;
		if (j > 0) {
			switch (om) {
			case 0:
				H8[off + 3 | 0] = str.charCodeAt(start);
			case 1:
				H8[off + 2 | 0] = str.charCodeAt(start + 1);
			case 2:
				H8[off + 1 | 0] = str.charCodeAt(start + 2);
			case 3:
				H8[off | 0] = str.charCodeAt(start + 3);
			}
		}
		for (i = om; i < j; i = i + 4 | 0) {
			H32[off + i >> 2] = str.charCodeAt(start + i) << 24 | str.charCodeAt(start + i + 1) << 16 | str.charCodeAt(start + i + 2) << 8 | str.charCodeAt(start + i + 3);
		}
		switch (lm) {
		case 3:
			H8[off + j + 1 | 0] = str.charCodeAt(start + j + 2);
		case 2:
			H8[off + j + 2 | 0] = str.charCodeAt(start + j + 1);
		case 1:
			H8[off + j + 3 | 0] = str.charCodeAt(start + j);
		}
        };
        // Convert a buffer or array and write it to the heap.
        // The buffer or array is expected to only contain elements < 256.
        let convBuf: any = function (H8: any, H32: any, start: any, len: any, off: any) {
		let buf = this, i: any, om = off % 4, lm = len % 4, j = len - lm;
		if (j > 0) {
			switch (om) {
			case 0:
				H8[off + 3 | 0] = buf[start];
			case 1:
				H8[off + 2 | 0] = buf[start + 1];
			case 2:
				H8[off + 1 | 0] = buf[start + 2];
			case 3:
				H8[off | 0] = buf[start + 3];
			}
		}
		for (i = 4 - om; i < j; i = i += 4 | 0) {
			H32[off + i >> 2] = buf[start + i] << 24 | buf[start + i + 1] << 16 | buf[start + i + 2] << 8 | buf[start + i + 3];
		}
		switch (lm) {
		case 3:
			H8[off + j + 1 | 0] = buf[start + j + 2];
		case 2:
			H8[off + j + 2 | 0] = buf[start + j + 1];
		case 1:
			H8[off + j + 3 | 0] = buf[start + j];
		}
        };
        let convFn = function (data: any): any {
		switch (util.getDataType(data)) {
		case 'string':
			return convStr.bind(data);
		case 'array':
			return convBuf.bind(data);
		case 'buffer':
			return convBuf.bind(data);
		case 'arraybuffer':
			return convBuf.bind(new Uint8Array(data));
		case 'view':
			return convBuf.bind(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
		}
        };
        let slice = function (data: any, offset: any): any {
		switch (util.getDataType(data)) {
		case 'string':
			return data.slice(offset);
		case 'array':
			return data.slice(offset);
		case 'buffer':
			return data.slice(offset);
		case 'arraybuffer':
			return data.slice(offset);
		case 'view':
			return data.buffer.slice(offset);
		}
        };
        // Convert an ArrayBuffer into its hexadecimal string representation.
        let hex = function (arrayBuffer: any): any {
		let i: any, x: any, hex_tab = '0123456789abcdef', res: any[] = [], binarray = new Uint8Array(arrayBuffer);
		for (i = 0; i < binarray.length; i++) {
			x = binarray[i];
			res[i] = hex_tab.charAt(x >> 4 & 15) + hex_tab.charAt(x >> 0 & 15);
		}
		return res.join('');
        };
        let ceilHeapSize = function (v: any): any {
		// The asm.js spec says:
		// The heap object's byteLength must be either
		// 2^n for n in [12, 24) or 2^24 * n for n ≥ 1.
		// Also, byteLengths smaller than 2^16 are deprecated.
		let p: any;
		// If v is smaller than 2^16, the smallest possible solution
		// is 2^16.
		if (v <= 65536)
			return 65536;
		// If v < 2^24, we round up to 2^n,
		// otherwise we round up to 2^24 * n.
		if (v < 16777216) {
			for (p = 1; p < v; p = p << 1);
		} else {
			for (p = 16777216; p < v; p += 16777216);
		}
		return p;
        };
        // Initialize the internal data structures to a new capacity.
        let init = function (size: any): any {
		if (size % 64 > 0) {
			throw new Error('Chunk size must be a multiple of 128 bit');
		}
		self$2.maxChunkLen = size;
		self$2.padMaxChunkLen = padlen(size);
		// The size of the heap is the sum of:
		// 1. The padded input message size
		// 2. The extended space the algorithm needs (320 byte)
		// 3. The 160 bit state the algoritm uses
		self$2.heap = new ArrayBuffer(ceilHeapSize(self$2.padMaxChunkLen + 320 + 20));
		self$2.h32 = new Int32Array(self$2.heap);
		self$2.h8 = new Int8Array(self$2.heap);
		self$2.core = new (<any>Rusha)._core({
			Int32Array: Int32Array,
			DataView: DataView
		}, {}, self$2.heap);
		self$2.buffer = null;
        };
        // Iinitializethe datastructures according
        // to a chunk siyze.
        init(chunkSize || 64 * 1024);
        let initState = function (heap: any, padMsgLen: any): any {
		let io = new Int32Array(heap, padMsgLen + 320, 5);
		io[0] = 1732584193;
		io[1] = -271733879;
		io[2] = -1732584194;
		io[3] = 271733878;
		io[4] = -1009589776;
        };
        let padChunk = function (chunkLen: any, msgLen: any): any {
		let padChunkLen = padlen(chunkLen);
		let view = new Int32Array(self$2.heap, 0, padChunkLen >> 2);
		padZeroes(view, chunkLen);
		padData(view, chunkLen, msgLen);
		return padChunkLen;
        };
        // Write data to the heap.
        let write = function (data: any, chunkOffset: any, chunkLen: any): any {
		convFn(data)(self$2.h8, self$2.h32, chunkOffset, chunkLen, 0);
        };
        // Initialize and call the RushaCore,
        // assuming an input buffer of length len * 4.
        let coreCall = function (data: any, chunkOffset: any, chunkLen: any, msgLen: any, finalize: any): any {
		let padChunkLen = chunkLen;
		if (finalize) {
			padChunkLen = padChunk(chunkLen, msgLen);
		}
		write(data, chunkOffset, chunkLen);
		self$2.core.hash(padChunkLen, self$2.padMaxChunkLen);
        };
        let getRawDigest = function (heap: any, padMaxChunkLen: any): any {
		let io = new Int32Array(heap, padMaxChunkLen + 320, 5);
		let out = new Int32Array(5);
		let arr = new DataView(out.buffer);
		arr.setInt32(0, io[0], false);
		arr.setInt32(4, io[1], false);
		arr.setInt32(8, io[2], false);
		arr.setInt32(12, io[3], false);
		arr.setInt32(16, io[4], false);
		return out;
        };
        // Calculate the hash digest as an array of 5 32bit integers.
        let rawDigest = this.rawDigest = function (str: any): any {
                let msgLen = str.byteLength || str.length || str.size || 0;
                initState(self$2.heap, self$2.padMaxChunkLen);
                let chunkOffset = 0, chunkLen = self$2.maxChunkLen, last: any;
                for (chunkOffset = 0; msgLen > chunkOffset + chunkLen; chunkOffset += chunkLen) {
			coreCall(str, chunkOffset, chunkLen, msgLen, false);
                }
                coreCall(str, chunkOffset, msgLen - chunkOffset, msgLen, true);
                return getRawDigest(self$2.heap, self$2.padMaxChunkLen);
        };
        // The digest and digestFrom* interface returns the hash digest
        // as a hex string.
        this.digest = this.digestFromString = this.digestFromBuffer = this.digestFromArrayBuffer = function (str: any): any {
		return hex(rawDigest(str).buffer);
        };
}
;
// The low-level RushCore module provides the heart of Rusha,
// a high-speed sha1 implementation working on an Int32Array heap.
// At first glance, the implementation seems complicated, however
// with the SHA1 spec at hand, it is obvious this almost a textbook
// implementation that has a few functions hand-inlined and a few loops
// hand-unrolled.
(<any>Rusha)._core = function RushaCore(stdlib: any, foreign: any, heap: any): any {
        'use asm';
        let H = new stdlib.Int32Array(heap);
        function hash(k: any, x: any) {
		// k in bytes
		k = k | 0;
		x = x | 0;
		let i = 0, j = 0, y0 = 0, z0 = 0, y1 = 0, z1 = 0, y2 = 0, z2 = 0, y3 = 0, z3 = 0, y4 = 0, z4 = 0, t0 = 0, t1 = 0;
		y0 = H[x + 320 >> 2] | 0;
		y1 = H[x + 324 >> 2] | 0;
		y2 = H[x + 328 >> 2] | 0;
		y3 = H[x + 332 >> 2] | 0;
		y4 = H[x + 336 >> 2] | 0;
		for (i = 0; (i | 0) < (k | 0); i = i + 64 | 0) {
			z0 = y0;
			z1 = y1;
			z2 = y2;
			z3 = y3;
			z4 = y4;
			for (j = 0; (j | 0) < 64; j = j + 4 | 0) {
				t1 = H[i + j >> 2] | 0;
				t0 = ((y0 << 5 | y0 >>> 27) + (y1 & y2 | ~y1 & y3) | 0) + ((t1 + y4 | 0) + 1518500249 | 0) | 0;
				y4 = y3;
				y3 = y2;
				y2 = y1 << 30 | y1 >>> 2;
				y1 = y0;
				y0 = t0;
				H[k + j >> 2] = t1;
			}
			for (j = k + 64 | 0; (j | 0) < (k + 80 | 0); j = j + 4 | 0) {
				t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
				t0 = ((y0 << 5 | y0 >>> 27) + (y1 & y2 | ~y1 & y3) | 0) + ((t1 + y4 | 0) + 1518500249 | 0) | 0;
				y4 = y3;
				y3 = y2;
				y2 = y1 << 30 | y1 >>> 2;
				y1 = y0;
				y0 = t0;
				H[j >> 2] = t1;
			}
			for (j = k + 80 | 0; (j | 0) < (k + 160 | 0); j = j + 4 | 0) {
				t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
				t0 = ((y0 << 5 | y0 >>> 27) + (y1 ^ y2 ^ y3) | 0) + ((t1 + y4 | 0) + 1859775393 | 0) | 0;
				y4 = y3;
				y3 = y2;
				y2 = y1 << 30 | y1 >>> 2;
				y1 = y0;
				y0 = t0;
				H[j >> 2] = t1;
			}
			for (j = k + 160 | 0; (j | 0) < (k + 240 | 0); j = j + 4 | 0) {
				t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
				t0 = ((y0 << 5 | y0 >>> 27) + (y1 & y2 | y1 & y3 | y2 & y3) | 0) + ((t1 + y4 | 0) - 1894007588 | 0) | 0;
				y4 = y3;
				y3 = y2;
				y2 = y1 << 30 | y1 >>> 2;
				y1 = y0;
				y0 = t0;
				H[j >> 2] = t1;
			}
			for (j = k + 240 | 0; (j | 0) < (k + 320 | 0); j = j + 4 | 0) {
				t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
				t0 = ((y0 << 5 | y0 >>> 27) + (y1 ^ y2 ^ y3) | 0) + ((t1 + y4 | 0) - 899497514 | 0) | 0;
				y4 = y3;
				y3 = y2;
				y2 = y1 << 30 | y1 >>> 2;
				y1 = y0;
				y0 = t0;
				H[j >> 2] = t1;
			}
			y0 = y0 + z0 | 0;
			y1 = y1 + z1 | 0;
			y2 = y2 + z2 | 0;
			y3 = y3 + z3 | 0;
			y4 = y4 + z4 | 0;
		}
		H[x + 320 >> 2] = y0;
		H[x + 324 >> 2] = y1;
		H[x + 328 >> 2] = y2;
		H[x + 332 >> 2] = y3;
		H[x + 336 >> 2] = y4;
        }
        return { hash: hash };
};

interface NamedStream {
	name: string;
	stream: NodeJS.ReadableStream
}

function concat(inputs: NamedStream[], output: NodeJS.WritableStream, code: number): void {
	'use strict';

	if (!inputs || !inputs.length) {
		process.exit(code);
		return;
	}

	let currentNS = inputs[0];
	inputs = inputs.slice(1);

	if (!currentNS) {
		// use setTimeout to avoid a deep stack as well as
		// cooperatively yield
		setTimeout(concat, 0, inputs, output, code);
		return;
	}

	let current = currentNS.stream;
	let result: Buffer = null;

	current.on('readable', function(): void {
		let buf: Buffer = <any>(current.read());
		if (buf === null)
			return;
		if (!result) {
			result = buf;
			return;
		}
		result = Buffer.concat([result, buf]);
	});

	current.on('end', function(): void {
		if (!result) {
			setTimeout(concat, 0, inputs, output, code);
			return;
		}
		let rusha: any = new (<any>Rusha)();
		let digest: string = rusha.digestFromBuffer(result);
		process.stdout.write(digest + ' ' + currentNS.name + '\n', () => {
			setTimeout(concat, 0, inputs, output, code);
		});
	});
}

function main(): void {
	'use strict';

	let argv = process.argv;
	let pathToNode = argv[0];
	let pathToScript = argv[1];
	let args = argv.slice(2);

	// exit code to use - if we fail to open an input file it gets
	// set to 1 below.
	let code = 0;

	if (!args.length)
		args = ['-'];

	let files: NamedStream[] = [];
	let opened = 0;
	// use map instead of a for loop so that we easily get the
	// tuple of (path, i) on each iteration.
	args.map(function(path: string, i: number): void {
		if (path === '-') {
			files[i] = {name: path, stream: process.stdin};
			// if we've opened all of the files, pipe them
			// to stdout.
			if (++opened === args.length)
				setTimeout(concat, 0, files, process.stdout, code);
			return;
		}
		fs.open(path, 'r', function(err: any, fd: any): void {
			if (err) {
				// if we couldn't open the specified
				// file we should print a message but
				// not exit early - we need to process
				// as many inputs as we can.
				files[i] = null;
				code = 1;
				process.stderr.write(pathToScript + ': ' + err.message + '\n');
			} else {
				files[i] = {name: path, stream: fs.createReadStream(path, {fd: fd})};
			}
			// if we've opened all of the files,
			// pipe them to stdout.
			if (++opened === args.length)
				setTimeout(concat, 0, files, process.stdout, code);
		});
	});
}

main();
