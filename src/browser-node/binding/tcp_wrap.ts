'use strict';

import { syscall, AF, SOCK } from '../syscall';
import { StreamWrap } from './stream_wrap';

export class TCP extends StreamWrap {

	fd: number;
	bound: boolean = false;
	listenPending: boolean = false;
	backlog: number = 511;

	constructor() {
		super();
		this.fd = -1;
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
			syscall.bind(fd, ipAddr, port, (bindErr?: any) => {
				console.log('bind finished: ' + bindErr);
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

	private _listen(): number {
		syscall.listen(this.fd, this.backlog, (err?: any) => {
			console.log('listening');
		});
		return 0;
	}
}
