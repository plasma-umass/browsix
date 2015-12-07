'use strict';

import { syscall } from '../syscall';
import * as constants from './constants';

export class FSReqWrap {
	oncomplete: (err: any, ...rest: any[])=>void = undefined;
	context: any = undefined;

	constructor() {
	}

	complete(...args: any[]): void {
		this.oncomplete.apply(this, arguments);
	}
}

// FIXME: this is copied from node's stdlib in order to avoid
// dependency/initialization issues
export class Stats {
	private atime: Date;
	private mtime: Date;
	private ctime: Date;
	private birthtime: Date;

	constructor(
		public dev: number,
		public mode: number,
		public nlink: number,
		public uid: number,
		public gid: number,
		public rdev: number,
		public blksize: number,
		public ino: number,
		public size: number,
		public blocks: number,
		atim_msec: string,
		mtim_msec: string,
		ctim_msec: string,
		birthtim_msec: string) {

		this.atime = new Date(atim_msec);
		this.mtime = new Date(mtim_msec);
		this.ctime = new Date(ctim_msec);
		this.birthtime = new Date(birthtim_msec);
	}

	_checkModeProperty(property: any): boolean {
		return ((this.mode & constants.S_IFMT) === property);
	}

	isDirectory(): boolean {
		return this._checkModeProperty(constants.S_IFDIR);
	}

	isFile(): boolean {
		return this._checkModeProperty(constants.S_IFREG);
	}

	isBlockDevice(): boolean {
		return this._checkModeProperty(constants.S_IFBLK);
	}

	isCharacterDevice(): boolean {
		return this._checkModeProperty(constants.S_IFCHR);
	}

	isSymbolicLink(): boolean {
		return this._checkModeProperty(constants.S_IFLNK);
	}

	isFIFO(): boolean {
		return this._checkModeProperty(constants.S_IFIFO);
	}

	isSocket(): boolean {
		return this._checkModeProperty(constants.S_IFSOCK);
	}
}

export function FSInitialize(stats: any): void {
}

export function open(path: string, flags: string, mode: number, req: FSReqWrap): void {
	syscall.open(path, flags, mode, req.complete.bind(req));
}

export function unlink(path: string, req: FSReqWrap): void {
	syscall.unlink(path, req.complete.bind(req));
}

export function rmdir(path: string, req: FSReqWrap): void {
	syscall.rmdir(path, req.complete.bind(req));
}

export function mkdir(path: string, mode: number, req: FSReqWrap): void {
	syscall.mkdir(path, mode, req.complete.bind(req));
}

export function utimes(path: string, atime: number, mtime: number, req: FSReqWrap): void {
	syscall.utimes(path, atime, mtime, req.complete.bind(req));
}

export function futimes(fd: number, atime: number, mtime: number, req: FSReqWrap): void {
	syscall.futimes(fd, atime, mtime, req.complete.bind(req));
}

export function readdir(path: string, req: FSReqWrap): void {
	syscall.readdir(path, req.complete.bind(req));
}

function statFinished(req: FSReqWrap, err: any, s: any): void {
	if (err) {
		req.complete(err, null);
		return;
	}

	// FIXME: is there a less-terrible way to do this?
	let stats = new Stats(
		s.dev,
		s.mode,
		s.nlink,
		s.uid,
		s.gid,
		s.rdev,
		s.blksize,
		s.ino,
		s.size,
		s.blocks,
		s.atime,
		s.mtime,
		s.ctime,
		s.birthtime);
	req.complete(null, stats);
}

export function fstat(fd: number, req: FSReqWrap): void {
	syscall.fstat(fd, statFinished.bind(undefined, req));
}

export function lstat(path: string, req: FSReqWrap): void {
	syscall.lstat(path, statFinished.bind(undefined, req));
}

export function stat(path: string, req: FSReqWrap): void {
	syscall.stat(path, statFinished.bind(undefined, req));
}

export function read(fd: number, buffer: any, offset: number, len: number, pos: number, req: FSReqWrap): void {
	if (typeof pos === 'undefined')
		pos = -1;
	syscall.pread(fd, len, pos, function readFinished(err: any, lenRead: number, data: Uint8Array): void {
		if (err) {
			req.complete(err, null);
			return;
		}
		for (let i = 0; i < lenRead; i++)
			buffer.writeUInt8(data[i], offset+i);
		req.complete(null, lenRead);
	});
}

export function writeBuffer(fd: number, buffer: any, offset: number, len: number, pos: number, req: FSReqWrap): void {
	let str = buffer.toString('utf-8', offset, offset+len);
	syscall.pwrite(fd, str, pos, req.complete.bind(req));
}

// FIXME: be efficient
export function writeBuffers(fd: number, chunks: any, pos: number, req: FSReqWrap): void {
	let errored = false;
	let done = 0;
	let written = 0;
	function chunkComplete(err: any, count: number): void {
		done++;
		if (err && !errored) {
			req.complete(err, undefined);
			errored = true;
			return;
		}
		written += count;
		if (done === chunks.length)
			req.complete(null, written);
	}
	for (let i = 0; i < chunks.length; i++) {
		let chunkReq = new FSReqWrap();
		chunkReq.oncomplete = chunkComplete;
		writeBuffer(fd, chunks[i], 0, chunks[i].length, undefined, chunkReq);
	}
}

export function close(fd: number, req: FSReqWrap): void {
	syscall.close(fd, req.complete.bind(req));
}
