/// <reference path="../../typings/node/node.d.ts" />

'use strict';

export class Pipe {
	buf: string = '';

	write(s: string): number {
		this.buf += ''+s;
		return s.length;
	}

	read(): string {
		return this.buf;
	}
}
