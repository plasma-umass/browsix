'use strict';

// sizeof(int32_t) == sizeof(intptr_t) ? 0x3fffffff : 0x7fffffff;
export const kMaxLength = 0x3fffffff; // 1024 MB aught to be enough for anybody.

// from browserify :(
function blitBuffer(src: any, dst: any, offset: number, length: number): number {
	let i: number;
	for (i = 0; i < length; i++) {
		if ((i + offset >= dst.length) || (i >= src.length))
			break;
		dst[i + offset] = src[i];
	}
	return i;
}

export function utf8Slice(buf: any, start: number, end: number): any {
	end = Math.min(buf.length, end);
	let res: any[] = [];

	let i = start;
	while (i < end) {
		let firstByte = buf[i];
		let codePoint: any = null;
		let bytesPerSequence = (firstByte > 0xEF) ? 4
			: (firstByte > 0xDF) ? 3
			: (firstByte > 0xBF) ? 2
			: 1;

		if (i + bytesPerSequence <= end) {
			let secondByte: any, thirdByte: any, fourthByte: any, tempCodePoint: any;

			switch (bytesPerSequence) {
			case 1:
				if (firstByte < 0x80) {
					codePoint = firstByte;
				}
				break;
			case 2:
				secondByte = buf[i + 1];
				if ((secondByte & 0xC0) === 0x80) {
					tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
					if (tempCodePoint > 0x7F) {
						codePoint = tempCodePoint;
					}
				}
				break;
			case 3:
				secondByte = buf[i + 1];
				thirdByte = buf[i + 2];
				if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
					tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
					if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
						codePoint = tempCodePoint;
					}
				}
				break;
			case 4:
				secondByte = buf[i + 1];
				thirdByte = buf[i + 2];
				fourthByte = buf[i + 3];
				if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
					tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
					if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
						codePoint = tempCodePoint;
					}
				}
			}
		}

		if (codePoint === null) {
			// we did not generate a valid codePoint so insert a
			// replacement char (U+FFFD) and advance only 1 byte
			codePoint = 0xFFFD;
			bytesPerSequence = 1;
		} else if (codePoint > 0xFFFF) {
			// encode to utf16 (surrogate pair dance)
			codePoint -= 0x10000;
			res.push(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}

		res.push(codePoint);
		i += bytesPerSequence;
	}

	return decodeCodePointsArray(res);
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints: any): any {
	let len = codePoints.length;
	if (len <= MAX_ARGUMENTS_LENGTH) {
		return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
	}

	// Decode in chunks to avoid "call stack size exceeded".
	let res = '';
	let i = 0;
	while (i < len) {
		res += String.fromCharCode.apply(
			String,
			codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
		);
	}
	return res;
}

export function utf8ToBytes(string: string, units?: number): any {
	units = units || Infinity;
	let codePoint: any;
	let length = string.length;
	let leadSurrogate: any = null;
	let bytes: any[] = [];

	for (let i = 0; i < length; i++) {
		codePoint = string.charCodeAt(i);

		// is surrogate component
		if (codePoint > 0xD7FF && codePoint < 0xE000) {
			// last char was a lead
			if (!leadSurrogate) {
				// no lead yet
				if (codePoint > 0xDBFF) {
					// unexpected trail
					if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
					continue;
				} else if (i + 1 === length) {
					// unpaired lead
					if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
					continue;
				}

				// valid lead
				leadSurrogate = codePoint;

				continue;
			}

			// 2 leads in a row
			if (codePoint < 0xDC00) {
				if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
				leadSurrogate = codePoint;
				continue;
			}

			// valid surrogate pair
			codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000;
		} else if (leadSurrogate) {
			// valid bmp char, but last char was a lead
			if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
		}

		leadSurrogate = null;

		// encode utf8
		if (codePoint < 0x80) {
			if ((units -= 1) < 0) break;
			bytes.push(codePoint);
		} else if (codePoint < 0x800) {
			if ((units -= 2) < 0) break;
			bytes.push(
				codePoint >> 0x6 | 0xC0,
				codePoint & 0x3F | 0x80
			);
		} else if (codePoint < 0x10000) {
			if ((units -= 3) < 0) break;
			bytes.push(
				codePoint >> 0xC | 0xE0,
				codePoint >> 0x6 & 0x3F | 0x80,
				codePoint & 0x3F | 0x80
			);
		} else if (codePoint < 0x110000) {
			if ((units -= 4) < 0) break;
			bytes.push(
				codePoint >> 0x12 | 0xF0,
				codePoint >> 0xC & 0x3F | 0x80,
				codePoint >> 0x6 & 0x3F | 0x80,
				codePoint & 0x3F | 0x80
			);
		} else {
			throw new Error('Invalid code point');
		}
	}

	return bytes;
}

function asciiSlice(buf: any, start: number, end: number): any {
	let ret = '';
	end = Math.min(buf.length, end);

	for (let i = start; i < end; i++) {
		ret += String.fromCharCode(buf[i] & 0x7F);
	}
	return ret;
}

export function setupBufferJS(prototype: any, bindingObj: any): void { // (Buffer.prototype, bindingObj);
	bindingObj.flags = [0];

	prototype.__proto__ = Uint8Array.prototype;

	prototype.utf8Write = function(str: string, offset: number, length: number): number {
		return blitBuffer(utf8ToBytes(str, this.length - offset), this, offset, length);
	};
	prototype.utf8Slice = function(start: number, end: number): any {
		return utf8Slice(this, start, end);
	};
	prototype.asciiSlice = function(start: number, end: number): any {
		return asciiSlice(this, start, end);
	};
	prototype.copy = function copy (target: any, targetStart: number, start: number, end: number): number {
		if (!start) start = 0;
		if (!end && end !== 0) end = this.length;
		if (targetStart >= target.length) targetStart = target.length;
		if (!targetStart) targetStart = 0;
		if (end > 0 && end < start) end = start;

		// Copy 0 bytes; we're done
		if (end === start) return 0;
		if (target.length === 0 || this.length === 0) return 0;

		// Fatal error conditions
		if (targetStart < 0) {
			throw new RangeError('targetStart out of bounds');
		}
		if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
		if (end < 0) throw new RangeError('sourceEnd out of bounds');

		// Are we oob?
		if (end > this.length) end = this.length;
		if (target.length - targetStart < end - start) {
			end = target.length - targetStart + start;
		}

		let len = end - start;
		let i: number;

		if (this === target && start < targetStart && targetStart < end) {
			// descending copy from end
			for (i = len - 1; i >= 0; i--) {
				target[i + targetStart] = this[i + start];
			}
		} else {
			// ascending copy from start
			for (i = 0; i < len; i++) {
				target[i + targetStart] = this[i + start];
			}
		}

		return len;
	};
	/*
	  env->set_buffer_prototype_object(proto);

	  env->SetMethod(proto, "asciiSlice", AsciiSlice);
	  env->SetMethod(proto, "base64Slice", Base64Slice);
	  env->SetMethod(proto, "binarySlice", BinarySlice);
	  env->SetMethod(proto, "hexSlice", HexSlice);
	  env->SetMethod(proto, "ucs2Slice", Ucs2Slice);
	  env->SetMethod(proto, "utf8Slice", Utf8Slice);

	  env->SetMethod(proto, "asciiWrite", AsciiWrite);
	  env->SetMethod(proto, "base64Write", Base64Write);
	  env->SetMethod(proto, "binaryWrite", BinaryWrite);
	  env->SetMethod(proto, "hexWrite", HexWrite);
	  env->SetMethod(proto, "ucs2Write", Ucs2Write);
	  env->SetMethod(proto, "utf8Write", Utf8Write);

	  env->SetMethod(proto, "copy", Copy);
	*/
}

export function createFromString(str: string, encoding: string): void {
	console.log('TODO: createFromString');
}
export function createFromArrayBuffer(obj: any): void {
	console.log('TODO: createFromArrayBuffer');
}
export function compare(a: any, b: any): void {
	console.log('TODO: compare');
}
export function byteLengthUtf8(str: string): number {
	return (<any>utf8ToBytes(str)).length;
}
export function indexOfString(buf: any, val: any, byteOffset: number): void {
	console.log('TODO: indexOfString');
}
export function indexOfBuffer(buf: any, val: any, byteOffset: number): void {
	console.log('TODO: indexOfBuffer');
}
export function indexOfNumber(buf: any, val: any, byteOffset: number): void {
	console.log('TODO: indexOfNumber');
}
export function fill(buf: any, val: any, start: number, end: number): void {
	console.log('TODO: fill');
}
export function readFloatLE(buf: any, offset: number): void {
	console.log('TODO: readFloatLE');
}
export function readFloatBE(buf: any, offset: number): void {
	console.log('TODO: readFloatBE');
}
export function readDoubleLE(buf: any, offset: number): void {
	console.log('TODO: readDoubleLE');
}
export function readDoubleBE(buf: any, offset: number): void {
	console.log('TODO: readDoubleBE');
}
export function writeFloatLE(buf: any, val: any, offset: number): void {
	console.log('TODO: writeFloatLE');
}
export function writeFloatBE(buf: any, val: any, offset: number): void {
	console.log('TODO: writeFloatBE');
}
export function writeDoubleLE(buf: any, val: any, offset: number): void {
	console.log('TODO: writeDoubleLE');
}
export function writeDoubleBE(buf: any, val: any, offset: number): void {
	console.log('TODO: writeDoubleBE');
}
