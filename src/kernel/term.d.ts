// Type definitions for termlib v0.0.7
// Project: https://github.com/chjj/term.js
// Definitions by: Bobby Powers <https://bpowers.net>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference path="../../typings/node/node.d.ts" />

export interface Stream extends NodeJS.EventEmitter {
	pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;
}

export declare interface TerminalArgs {
	cols: number;
	rows: number;
	screenKeys: boolean;
}

export declare class Terminal implements Stream {

	constructor(args: TerminalArgs);
	open(parent: Element): void;
	write(data: string): boolean;


	addListener(event: string, listener: Function): NodeJS.EventEmitter;
	on(event: string, listener: Function): NodeJS.EventEmitter;
	once(event: string, listener: Function): NodeJS.EventEmitter;
	removeListener(event: string, listener: Function): NodeJS.EventEmitter;
	removeAllListeners(event?: string): NodeJS.EventEmitter;
	setMaxListeners(n: number): void;
	listeners(event: string): Function[];
	emit(event: string, ...args: any[]): boolean;

	pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;
}
