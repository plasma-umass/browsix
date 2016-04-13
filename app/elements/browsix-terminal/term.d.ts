// Type definitions for termlib v0.0.7
// Project: https://github.com/chjj/term.js
// Definitions by: Bobby Powers <https://bpowers.net>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module Terminal {

	// copied from node.d.ts
	export interface EventEmitter {
		addListener(event: string, listener: Function): EventEmitter;
		on(event: string, listener: Function): EventEmitter;
		once(event: string, listener: Function): EventEmitter;
		removeListener(event: string, listener: Function): EventEmitter;
		removeAllListeners(event?: string): EventEmitter;
		setMaxListeners(n: number): void;
		listeners(event: string): Function[];
		emit(event: string, ...args: any[]): boolean;
	}

	export interface Stream extends EventEmitter {
		pipe<T extends WritableStream>(destination: T, options?: { end?: boolean; }): T;
	}

	export interface Terminal extends Stream {
		on(event: string, listener: Function): Terminal;
	}
}

declare var Terminal: typeof Terminal.Terminal;
