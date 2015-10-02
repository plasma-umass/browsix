'use strict';

import { syscall, SyscallResponse } from './syscall';

export interface OpenCallback {
	(err: any, fd: any): void;
}

export class FS {
	open(path: string, flags: string, mode: number|OpenCallback, callback: OpenCallback): void {
		let nmode: number;
		if (typeof mode === 'number') {
			nmode = nmode;
		} else {
			callback = <OpenCallback>mode;
			// octal 0666, octal not allowed in strict mode :\
			nmode = 438;
		}
		syscall.open(path, flags, nmode).then(function(fd: number): void {
			console.log('userspace open: ' + fd);
			callback(null, fd);
		}).catch(function(reason: any): void {
			console.log('userspace open err: ' + reason);
			callback(reason, null);
		});
	}

	createReadStream(path: string, options: {fd: any}): NodeJS.ReadableStream {
		console.log('TODO: createReadStream');
		return null; // new ReadStream(path, options);
	}
}
export var fs = new FS();

/*
// from node 4.1
class StreamReadable {
	readable: boolean = true;

	addListener(event: string, listener: Function): NodeJS.EventEmitter;
	on(event: string, listener: Function): NodeJS.EventEmitter;
	once(event: string, listener: Function): NodeJS.EventEmitter;
	removeListener(event: string, listener: Function): NodeJS.EventEmitter;
	removeAllListeners(event?: string): NodeJS.EventEmitter;
	setMaxListeners(n: number): void;
	listeners(event: string): Function[];
	emit(event: string, ...args: any[]): boolean;

	read(size?: number): string|Buffer;
	setEncoding(encoding: string): void;
	pause(): void;
	resume(): void;
	pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;
	unpipe<T extends NodeJS.WritableStream>(destination?: T): void;
	unshift(chunk: string): void;
	unshift(chunk: Buffer): void;
	wrap(oldStream: NodeJS.ReadableStream): NodeJS.ReadableStream;
}

class ReadStream extends StreamReadable {
	constructor(path: string, options: any) {
		super();

		//if (!(this instanceof ReadStream))
		//	return new ReadStream(path, options);

		if (options === undefined)
			options = {};
		else if (typeof options === 'string')
			options = { encoding: options };
		else if (options === null || typeof options !== 'object')
			throw new TypeError('options must be a string or an object');

		// a little bit bigger buffer and water marks by default
		options = Object.create(options);
		if (options.highWaterMark === undefined)
			options.highWaterMark = 64 * 1024;

		Readable.call(this, options);

		this.path = path;
		this.fd = options.fd === undefined ? null : options.fd;
		this.flags = options.flags === undefined ? 'r' : options.flags;
		this.mode = options.mode === undefined ? 0o666 : options.mode;

		this.start = options.start;
		this.end = options.end;
		this.autoClose = options.autoClose === undefined ? true : options.autoClose;
		this.pos = undefined;

		if (this.start !== undefined) {
			if (typeof this.start !== 'number') {
				throw new TypeError('start must be a Number');
			}
			if (this.end === undefined) {
				this.end = Infinity;
			} else if (typeof this.end !== 'number') {
				throw new TypeError('end must be a Number');
			}

			if (this.start > this.end) {
				throw new Error('start must be <= end');
			}

			this.pos = this.start;
		}

		if (typeof this.fd !== 'number')
			this.open();

		this.on('end', function(): void {
			if (this.autoClose) {
				this.destroy();
			}
		});
	}

	open(): void {
		let self = this;
		fs.open(this.path, this.flags, this.mode, function(er, fd): void {
			if (er) {
				if (self.autoClose) {
					self.destroy();
				}
				self.emit('error', er);
				return;
			}

			self.fd = fd;
			self.emit('open', fd);
			// start the flow of data.
			self.read();
		});
	};

	_read(n): void {
		if (typeof this.fd !== 'number')
			return this.once('open', function(): void {
				this._read(n);
			});

		if (this.destroyed)
			return;

		if (!pool || pool.length - pool.used < kMinPoolSpace) {
			// discard the old pool.
			pool = null;
			allocNewPool(this._readableState.highWaterMark);
		}

		// Grab another reference to the pool in the case that while we're
		// in the thread pool another read() finishes up the pool, and
		// allocates a new one.
		let thisPool = pool;
		let toRead = Math.min(pool.length - pool.used, n);
		let start = pool.used;

		if (this.pos !== undefined)
			toRead = Math.min(this.end - this.pos + 1, toRead);

		// already read everything we were supposed to read!
		// treat as EOF.
		if (toRead <= 0)
			return this.push(null);

		// the actual read.
		let self = this;
		fs.read(this.fd, pool, pool.used, toRead, this.pos, onread);

		// move the pool positions, and internal position for reading.
		if (this.pos !== undefined)
			this.pos += toRead;
		pool.used += toRead;

		function onread(er, bytesRead): void {
			if (er) {
				if (self.autoClose) {
					self.destroy();
				}
				self.emit('error', er);
			} else {
				let b = null;
				if (bytesRead > 0)
					b = thisPool.slice(start, start + bytesRead);

				self.push(b);
			}
		}
	}

	destroy(): void {
		if (this.destroyed)
			return;
		this.destroyed = true;
		this.close();
	}

	close(cb): void {
		let self = this;
		if (cb)
			this.once('close', cb);
		if (this.closed || typeof this.fd !== 'number') {
			if (typeof this.fd !== 'number') {
				this.once('open', close);
				return;
			}
			return process.nextTick(this.emit.bind(this, 'close'));
		}
		this.closed = true;
		close();

		function close(fd): void {
			fs.close(fd || self.fd, function(er): void {
				if (er)
					self.emit('error', er);
				else
					self.emit('close');
			});
			self.fd = null;
		}
	}
}
*/
