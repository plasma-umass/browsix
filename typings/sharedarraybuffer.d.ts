
interface SharedArrayBuffer {
	/**
	 * Read-only. The length of the ArrayBuffer (in bytes).
	 */
	byteLength: number;

	/*
	 * The SharedArrayBuffer constructor's length property whose value is 1.
	 */
	length: number;
	/**
	 * Returns a section of an SharedArrayBuffer.
	 */
	slice(begin: number, end?: number): SharedArrayBuffer;
}

interface SharedArrayBufferConstructor {
	prototype: SharedArrayBuffer;
	new (byteLength: number): SharedArrayBuffer;
}

declare var SharedArrayBuffer: SharedArrayBufferConstructor;
