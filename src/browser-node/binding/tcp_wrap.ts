'use strict';

import * as uv from './uv';
import { syscall, AF, SOCK } from '../syscall';
import { StreamWrap, WriteWrap } from './stream_wrap';
import * as marshal from 'node-binary-marshal';

declare var Buffer: any;

export class Req {
	localAddress: string;
	localPort:    number;

	address:      string;
	port:         number;
}

export class TCPConnectWrap {
	oncomplete: (status: number, handle: TCP, req: Req, readable: boolean, writable: boolean)=>void = undefined;
	address: string = '';
	port: number = -1;
	fd: number;

	constructor(fd: number = -1) {
		this.fd = fd;
	}
}

export class TCP extends StreamWrap {

	fd:            number;
	owner:         any;
	bound:         boolean   = false;
	listenPending: boolean   = false;
	backlog:       number    = 511;
	onconnection:  Function;
	onread:        Function;
	addr:          string;
	port:          number;

	constructor(fd: number = -1, bound: boolean = false) {
		super();
		this.fd = fd;
		this.bound = bound;
	}

	getpeername(out: any): void {
		out.address = this.addr;
		out.port = this.port;
		out.family = 'tcp';
	}

	close(cb: () => void): void {
		//setTimeout(this.onread.bind(this), 0, uv.UV_EOF, null);
		syscall.close(this.fd, () => {
			this.fd = -1;
			cb();
		});
	}

	connect(conn: TCPConnectWrap, addr: string, port: number): void {
		syscall.socket(AF.INET, SOCK.STREAM, 0, (err: any, fd: number) => {
			// FIXME: call req.oncomplete
			if (err) {
				console.log('socket open failed');
				return;
			}

			let sockAddr = {
				family: SOCK.STREAM,
				port: port,
				addr: addr,
			};
			let buf = new Uint8Array(marshal.socket.SockAddrInDef.length);
			let view = new DataView(buf.buffer, buf.byteOffset);
			let _: any;
			[_, err] = marshal.Marshal(view, 0, sockAddr, marshal.socket.SockAddrInDef);
			if (err) {
				console.log('connect: marshal failed');
				return;
			}

			syscall.connect(fd, buf, (connErr: any, localAddr: string, localPort: number) => {
				let req = new Req();
				req.localAddress = localAddr;
				req.localPort = localPort;
				req.address = addr;
				req.port = port;

				if (connErr) {
					conn.oncomplete(-1, this, req, false, false);
					return;
				}

				this.fd = fd;
				this.bound = true;
				conn.oncomplete(0, this, req, true, true);
			});
		});
	}

	bind6(ipAddr: string, port: number): number {
		if (ipAddr === '::')
			return this.bind('localhost', port);
		throw new Error('TODO: implement bind6');
	}

	// FIXME: node provides this as a synchronous API, UGH.
	bind(ipAddr: string, port: number): number {

		syscall.socket(AF.INET, SOCK.STREAM, 0, (err: any, fd: number) => {
			if (err) {
				console.log('socket open failed');
				debugger;
				return;
			}
			this.fd = fd;

			// node's tcp_wrap calls into uv__tcp_bind, which
			let sockAddr = {
				family: SOCK.STREAM,
				port: port,
				addr: ipAddr,
			};
			let buf = new Uint8Array(marshal.socket.SockAddrInDef.length);
			let view = new DataView(buf.buffer, buf.byteOffset);
			let _: any;
			[_, err] = marshal.Marshal(view, 0, sockAddr, marshal.socket.SockAddrInDef);
			if (err) {
				console.log('marshal failed');
				debugger;
				return;
			}

			syscall.bind(fd, buf, (bindErr?: any) => {
				if (bindErr) {
					console.log('bind failed: ' + bindErr);
					debugger;
					return;
				}

				this.bound = true;
				if (this.listenPending)
					this._listen();
			});
		});

		return 0;
	}

	listen(backlog: number): number {
		this.backlog = backlog;
		if (this.bound)
			this._listen();
		else
			this.listenPending = true;

		return 0;
	}

	writeBinaryString(req: WriteWrap, data: string): void {
		syscall.pwrite(this.fd, data, -1, (err: any) => {
			let status = err < 0 ? -1 : 0;
			err = err >= 0 ? undefined : err;
			req.oncomplete(status, this, req, err);
		});
	}

	writeUtf8String(req: WriteWrap, data: string): void {
		syscall.pwrite(this.fd, data, -1, (err: any) => {
			let status = err < 0 ? -1 : 0;
			err = err >= 0 ? undefined : err;
			req.oncomplete(status, this, req, err);
		});
	}

	readStart(): void {
		this._read();
	}

	private _read(): void {
		if (this.fd < 0)
			return;
		syscall.pread(this.fd, 262144, -1, (err: any, dataLen: number, data: Uint8Array) => {
			let n = dataLen ? dataLen : uv.UV_EOF;
			if (this.onread) {
				let b: Buffer = data ? new Buffer(data): null;
				this.onread(n, b);
			}
			if (this.fd !== -1)
				setTimeout(this._read.bind(this), 0);
		});
	}

	private _listen(): void {
		syscall.listen(this.fd, this.backlog, (err?: any) => {
			if (err) {
				console.log('listen failed: ' + err);
				debugger;
				return;
			}
			this._accept();
		});
		return;
	}

	private _accept(): void {
		syscall.accept(this.fd, (err: any, fd?: number, addr?: string, port?: number) => {
			// FIXME: ClientHandle??  is this a new TCP?
			if (err) {
				this.onconnection(err);
			} else {
				let handle = new TCP(fd, true);
				handle.addr = addr;
				handle.port = port;
				this.onconnection(undefined, handle);
			}
			setTimeout(this._accept.bind(this), 0);
		});
	}
}
