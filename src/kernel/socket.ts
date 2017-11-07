// Copyright 2016 The Browsix Authors. All rights reserved.
// Use of this source code is governed by the ISC
// license that can be found in the LICENSE file.

'use strict';

import { EINVAL, ESPIPE } from './constants';
import { ConnectCallback, RWCallback, SyscallContext, IFile, ITask } from './types';
import { Pipe } from './pipe';
import Peer = require('peerjs');

export interface AcceptCallback {
	(err: number, s?: SocketFile, remoteAddr?: string, remotePort?: number): void;
}

export function isSocket(f: IFile): f is SocketFile {
	return f instanceof SocketFile;
}

export interface Incoming {
	s: SocketFile;
	addr: string;
	port: number;
	cb: ConnectCallback;
}

export class SocketFile implements IFile {
	task:                    ITask;
	isListening:             boolean           = false;
	parent:                  SocketFile        = undefined;
	refCount:                number            = 1;

	port:                    number;
	addr:                    string;

	peer:                    SocketFile        = undefined;

	outgoing:                Pipe              = undefined;
	incoming:                Pipe              = undefined;

	incomingQueue:           Incoming[]        = [];
	acceptQueue:             AcceptCallback[]  = [];

	isWebRTC:                boolean           = false;
	peerConnection:          any               = undefined;
	peerObject:              any               = undefined;
	webRTCReadBuffer:        Pipe              = undefined;

	constructor(task: ITask) {
		this.task = task;
		this.webRTCReadBuffer = new Pipe();
	}

	setConnection(conn: any): any {
		this.peerConnection = conn;
		console.log("SetConnection");
		console.log(this.peerConnection);
		console.log(this);
	}

	getOnData(): any {
		return this.onData.bind(this);
	}

	onData(data: any): any {
		console.log("received data!");
		console.log(data);
		console.log(this);
		this.webRTCReadBuffer.write(data);
	}

	stat(cb: (err: any, stats: any) => void): void {
		throw new Error('TODO: SocketFile.stat not implemented');
	}

	readdir(cb: (err: any, files: string[]) => void): void {
		setTimeout(cb, 0, 'cant readdir on normal file');
	}

	listen(cb: (err: number) => void): void {
		this.isListening = true;
		if (this.isWebRTC) {
			console.log("creating new peer in listen");
			let listenName = this.addr + ":" + this.port.toString();
			console.log("listening on: " + listenName);
			crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(listenName)).then(function (hashedAddrPort: any): any {
				// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
				function hex(buffer: any): any {
					let hexCodes = [];
					let view = new DataView(buffer);
					for (let i = 0; i < view.byteLength; i += 4) {
						// Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
						let value = view.getUint32(i);
						// toString(16) will give the hex representation of the number without padding
						let stringValue = value.toString(16);
						// We use concatenation and slice for padding
						let padding = "00000000";
						let paddedValue = (padding + stringValue).slice(-padding.length);
						hexCodes.push(paddedValue);
					}
					// Join all the hex strings into one
					return hexCodes.join("");
				}
				console.log(hex(hashedAddrPort));
				let newPeer = new Peer(hex(hashedAddrPort), {host: 'localhost', port: 9000, path: '/browsix-net'});
				this.peerObject = newPeer;
				cb(0);
			}.bind(this));
		} else {
			cb(0);
		}
	}

	accept(cb: AcceptCallback): void {
		console.log("accept called");
		if (this.isWebRTC) {
			console.log(this.peerObject);
			this.peerObject.on('connection', function(conn: any): any {
				console.log("listening completed - established connection to remote peer");
				conn.on('open', function(): any {
					console.log(conn);
					let local = new SocketFile(this.task);
					local.isWebRTC = true;
					local.setConnection(conn);
					conn.on('data', local.onData.bind(local));
					cb(0, local, "remoteaddr", 5555);
				});
			});
		} else {
			if (!this.incomingQueue.length) {
				this.acceptQueue.push(cb);
				return;
			}

			let queued = this.incomingQueue.shift();

			let remote = queued.s;
			let local = new SocketFile(this.task);
			local.addr = queued.addr;
			local.port = queued.port;

			let outgoing = new Pipe();
			let incoming = new Pipe();

			local.outgoing = outgoing;
			remote.incoming = outgoing;

			local.incoming = incoming;
			remote.outgoing = incoming;

			local.peer = remote;
			remote.peer = local;

			cb(0, local, queued.addr, queued.port);
			queued.cb(null);
		}
	}

	doAccept(remote: SocketFile, remoteAddr: string, remotePort: number, cb: ConnectCallback): void {
		console.log("doAccept called");
		if (!this.acceptQueue.length) {
			this.incomingQueue.push({
				s: remote,
				addr: remoteAddr,
				port: remotePort,
				cb: cb,
			});
			return;
		}

		let acceptCB = this.acceptQueue.shift();

		let local = new SocketFile(this.task);
		local.addr = remoteAddr;
		local.port = remotePort;

		let outgoing = new Pipe();
		let incoming = new Pipe();

		local.outgoing = outgoing;
		remote.incoming = outgoing;

		local.incoming = incoming;
		remote.outgoing = incoming;

		local.peer = remote;
		remote.peer = local;

		acceptCB(0, local, remoteAddr, remotePort);
		cb(null);
	}

	connect(addr: string, port: number, cb: ConnectCallback): void {
		this.task.kernel.connect(this, addr, port, cb);
	}


	read(buf: Buffer, pos: number, cb: RWCallback): void {
		console.log("read called");
		if (pos !== -1)
			return cb(-ESPIPE);
		if (this.isWebRTC) {
			this.webRTCReadBuffer.read(buf, 0, buf.length, undefined, cb);
		} else {
			this.incoming.read(buf, 0, buf.length, undefined, cb);
		}
	}

	write(buf: Buffer, pos: number, cb: RWCallback): void {
		if (pos !== -1)
			return cb(-ESPIPE);
		console.log("write called");
		console.log(this);
		if (this.isWebRTC) {
			console.log(this.peerConnection);
			console.log(buf.toString());
			this.peerConnection.send(buf.toString());
			cb(0, buf.length);
		} else {
			this.outgoing.writeBuffer(buf, cb);
		}
	}

	readSync(): Buffer {
		return this.incoming.readSync();
	}

	llseek(offhi: number, offlo: number, whence: number, cb: (err: number, off: number) => void): void {
		cb(-EINVAL, undefined);
	}

	ref(): void {
		this.refCount++;
		if (this.outgoing)
			this.outgoing.ref();
		if (this.incoming)
			this.incoming.ref();
	}

	unref(): void {
		if (this.outgoing)
			this.outgoing.unref();
		if (this.incoming)
			this.incoming.unref();
		this.refCount--;
		if (!this.refCount) {
			if (this.isListening)
				this.task.kernel.unbind(this, this.addr, this.port);
		}
	}
}
