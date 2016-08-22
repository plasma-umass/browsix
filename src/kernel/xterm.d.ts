// from https://github.com/plasma-umass/doppio-demo/blob/abd49263e5/src/js/xterm.d.ts
// Copyright (c) 2016 John Vilk.

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


declare module "xterm" {
	import {EventEmitter} from 'events';

	interface TerminalOptions {
		colors?: string[];
		convertEol?: boolean;
		termName?: string;
		cursorBlink?: boolean;
		visualBell?: boolean;
		popOnBell?: boolean;
		scrollback?: number;
		screenKeys?: boolean;
		debug?: boolean;
		useStyle?: boolean;
		useEvents?: boolean;
		useFocus?: boolean;
		useMouse?: boolean;
		cancelEvents?: boolean;
		/**
		 * Alias for parent.
		 */
		body?: HTMLElement;
		/**
		 * HTML element to place Terminal into.
		 */
		parent?: HTMLElement;
		/**
		 * Number of columns to use for the terminal.
		 */
		cols?: number;
		/**
		 * Number of rows to use for the terminal.
		 */
		rows?: number;
		/**
		 * Alias for [cols, rows]
		 */
		geometry?: [number, number];
		/**
		 * Alias for term.on('data', handler);
		 */
		handler?: (data: string) => any;
	}

	interface TermMiddlewareOptions {
		path: string;
	}

	/**
	 * term.js implements a basic Stream API that is a simple subset of NodeJS streams.
	 */
	class Stream extends EventEmitter {
		pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;
	}

	/**
	 * A term.js Terminal emulates a basic version of NodeJS Streams, EventEmitter, and TTY Read/WriteStream.
	 * However, it only emulates a subset of those APIs, so it does not properly extend those classes,
	 * with the exception of EventEmitter.
	 */
	class Terminal extends Stream {
		/**
		 * Default Terminal options.
		 */
		public static defaults: TerminalOptions;
		/**
		 * Default Terminal options (alias of Terminal.defaults)
		 */
		public static options: TerminalOptions;
		/**
		 * The currently focused terminal.
		 */
		public static focus: Terminal;
		/**
		 * Lookup table from color index to HTML color (e.g. '#000000')
		 */
		public static colors: string[];
		public static tangoColors: string[];
		public static xtermColors: string[];
		/**
		 * Color lookup table, with colors in numerical form.
		 */
		public static vcolors: number[];

		public static brokenBold: boolean;

		public static charsets: {[name: string]: {[key: string]: string}};

		public static bindPaste(document: Document): void;
		public static bindKeys(document: Document): void;
		public static bindCopy(document: Document): void;
		public static insertStyle(document: Document, fg: string, bg: string): void;

		public useStyle: boolean;
		public isMac: boolean;
		public isIpad: boolean;
		public isIPhone: boolean;
		public isMSIE: boolean;

		/**
		 * The window context in which the Terminal is hosted.
		 */
		public context: Window;
		/**
		 * The document context in which the Terminal is hosted.
		 */
		public document: Document;
		/**
		 * The body element in which the terminal is hosted.
		 */
		public body: HTMLBodyElement;

		/**
		 * The Terminal's color lookup table.
		 */
		public colors: string[];
		public options: TerminalOptions;
		public parent: HTMLElement;
		public cols: number;
		public rows: number;

		public ybase: number;
		public ydisp: number;
		public x: number;
		public y: number;
		public cursorState: number;
		public cursorHidden: boolean;
		public convertEol: boolean;
		public state: number;
		public queue: string;
		public scrollTop: number;
		public scrollBottom: number;

		// modes
		public applicationKeypad: boolean;
		public applicationCursor: boolean;
		public originMode: boolean;
		public insertMode: boolean;
		public wraparoundMode: boolean;
		public normal: {
			lines: [number, string][];
			ybase: number;
			ydisp: number;
			x: number;
			y: number;
			scrollTop: number;
			scrollBottom: number;
			tabs: {[index: number]: boolean};
		};

		// charset
		public charset: {[key: string]: string};
		public gcharset: number;
		public glevel: number;
		public charsets: {[name: string]: {[key: string]: string}};

		// mouse properties
		public decLocator: boolean;
		public x10Mouse: boolean;
		public vt200Mouse: boolean;
		public vt300Mouse: boolean;
		public normalMouse: boolean;
		public mouseEvents: boolean;
		public sendFocus: boolean;
		public utfMouse: boolean;
		public sgrMouse: boolean;
		public urxvtMouse: boolean;

		// misc
		/**
		 * Element hosting the terminal.
		 */
		public element: HTMLDivElement;
		/**
		 * Element containing our screen rows.
		 */
		public rowContainer: HTMLDivElement;
		/**
		 * Child elements of terminal containing terminal lines.
		 */
		public children: HTMLDivElement[];
		public refreshStart: number;
		public refreshEnd: number;
		public savedX: number;
		public savedY: number;
		public savedCols: number;

		// stream
		public readable: boolean;
		public writable: boolean;

		public defAttr: number;
		public curAttr: number;

		public params: number[];
		public currentParam: string | number;
		public prefix: string;
		public postfix: string;

		public lines: [number, string][][];

		public tabs: {[index: number]: boolean};


		constructor(cols: number, rows: number, handler: Function);
		constructor(options: TerminalOptions);

		/**
		 * Focus this particular terminal.
		 */
		public focus(): void;
		public blur(): void;
		/**
		 * Initialize global behavior.
		 */
		public initGlobal(): void;

		/**
		 * Open the terminal using the given parent element.
		 */
		public open(parent: HTMLElement): void;
		/**
		 * Refresh the terminal from line [start, end], inclusive and 0 indexed.
		 */
		public refresh(start: number, end: number): void;
		/**
		 * Starts blinking the cursor.
		 */
		public startBlink(): boolean;
		public bindMouse(): void;

		/**
		 * [Node TTY emulation] Enables/disables raw mode.
		 */
		public setRawMode(enable: boolean): void;

		public destroy(): void;
		public showCursor(): void;
		public refreshBlink(): void;
		public scroll(): void;
		public scrollDisp(disp: number): void;
		public write(data: string): boolean;
		public writeln(data: string): boolean;
		public keyDown(ev: MouseEvent): boolean;
		public setgLevel(g: string): void;
		public setgCharset(g: string, charset: {[key: string]: string}): void;
		public keyPress(ev: KeyboardEvent): boolean;
		public send(data: string): void;
		public bell(): void;
		public log(...args: string[]): void;
		public error(...args: string[]): void;
		public resize(x: number, y: number): void;
		public updateRange(y: number): void;
		public maxRange(): void;
		public setupStops(i: number): void;
		public prevStop(x?: number): void;
		public nextStop(x?: number): void;
		public eraseAttr(): number;
		public eraseRight(x: number, y: number): void;
		public eraseLeft(x: number, y: number): void;
		public eraseLine(y: number): void;
		public blankLine(cur: boolean): [number, string];
		public ch(cur: boolean): [number, string];
		public is(term: string): boolean;
		public handler(data: string): void;
		public handleTitle(title: string): void;
		public index(): void;
		public reverseIndex(): void;
		public reset(): void;
		public tabSet(): void;
		public cursorUp(params: number[]): void;
		public cursorDown(params: number[]): void;
		public cursorForward(params: number[]): void;
		public cursorBackward(params: number[]): void;
		public cursorPos(params: number[]): void;
		public eraseInDisplay(params: number[]): void;
		public eraseInLine(params: number[]): void;
		public charAttributes(params: number[]): void;
		public deviceStatus(params: number[]): void;
		public insertChars(params: number[]): void;
		public cursorNextLine(params: number[]): void;
		public cursorPrecedingLine(params: number[]): void;
		public cursorCharAbsolute(params: number[]): void;
		public insertLines(params: number[]): void;
		public deleteLines(params: number[]): void;
		public deleteChars(params: number[]): void;
		public eraseChars(params: number[]): void;
		public charPosAbsolute(params: number[]): void;
		public HPositionRelative(params: number[]): void;
		public sendDeviceAttributes(params: number[]): void;
		public linePosAbsolute(params: number[]): void;
		public VPositionRelative(params: number[]): void;
		public HVPosition(params: number[]): void;
		public setMode(params: number | number[]): void;
		public resetMode(params: number | number[]): void;
		public setScrollRegion(params: number[]): void;
		public saveCursor(): void;
		public restoreCursor(): void;
		public cursorForwardTab(params: number[]): void;
		public scrollUp(params: number[]): void;
		public scrollDown(params: number[]): void;
		public initMouseTracking(params: number[]): void;
		public resetTitleModes(params: number[]): void;
		public cursorBackwardTab(params: number[]): void;
		public repeatPrecedingCharacter(params: number[]): void;
		public tabClear(params: number[]): void;
		public mediaCopy(params: number[]): void;
		public setResources(params: number[]): void;
		public disableModifiers(params: number[]): void;
		public setPointerMode(params: number[]): void;
		public softReset(): void;
		public requestAnsiMode(params: number[]): void;
		public requestPrivateMode(params: number[]): void;
		public setConformanceLevel(params: number[]): void;
		public loadLEDs(params: number[]): void;
		public setCursorStyle(params: number[]): void;
		public setCharProtectionAttr(params: number[]): void;
		public restorePrivateValues(params: number[]): void;
		public setAttrInRectangle(params: number[]): void;
		public savePrivateValues(params: number[]): void;
		public manipulateWindow(params: number[]): void;
		public reverseAttrInRectangle(params: number[]): void;
		public setTitleModeFeature(params: number[]): void;
		public setWarningBellVolume(params: number[]): void;
		public setMarginBellVolume(params: number[]): void;
		public copyRectangle(params: number[]): void;
		public enableFilterRectangle(params: number[]): void;
		public requestParameters(params: number[]): void;
		public selectChangeExtent(params: number[]): void;
		public fillRectangle(params: number[]): void;
		public enableLocatorReporting(params: number[]): void;
		public eraseRectangle(params: number[]): void;
		public setLocatorEvents(params: number[]): void;
		public selectiveEraseRectangle(params: number[]): void;
		public requestLocatorPosition(params: number[]): void;
		public insertColumns(params: number[]): void;
		public deleteColumns(params: number[]): void;
		public copyBuffer(lines?: [number, string][]): void;
		public getCopyTextarea(): HTMLTextAreaElement;
		public copyText(text: string): void;
		public keyPrefix(ev: KeyboardEvent, key: string): void;
		public keySelect(ev: KeyboardEvent, key: string): void;

		/**
		 * Emits any copied text.
		 */
		public on(event: 'copy', listener: (text: string) => any): this;
		public on(event: 'refresh', listener: (data: {
			element: HTMLDivElement,
			start: number,
			end: number
		}) => any): this;
		public on(event: 'request paste', listener: () => any): this;
		public on(event: 'request create', listener: () => any): this;
		public on(event: 'request term', listener: () => any): this;
		public on(event: 'request term next', listener: () => any): this;
		public on(event: 'request term previous', listener: () => any): this;
		public on(event: 'request command mode', listener: () => any): this;
		public on(event: 'open', listener: () => any): this;
		public on(event: 'keydown', listener: (ev: KeyboardEvent) => any): this;
		public on(event: 'keypress', listener: (ev: KeyboardEvent) => any): this;
		public on(event: 'key', listener: (key: string, ev: KeyboardEvent) => any): this;
		public on(event: 'resize', listener: () => any): this;
		public on(event: 'data', listener: (data: string) => any): this;
		public on(event: 'title', listener: (title: string) => any): this;
		public on(eventName: string, listener: Function): this;
	}

	export = Terminal;
}
