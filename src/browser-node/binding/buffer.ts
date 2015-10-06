
// sizeof(int32_t) == sizeof(intptr_t) ? 0x3fffffff : 0x7fffffff;
export const kMaxLength = 0x3fffffff; // 1024 MB aught to be enough for anybody.

export function setupBufferJS(prototype: any, bindingObj: any): void { // (Buffer.prototype, bindingObj);
	bindingObj.flags = [0];
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

export function createFromString(str: string, encoding: string): void {}
export function createFromArrayBuffer(obj: any): void {}
export function compare(a: any, b: any): void {}
export function byteLengthUtf8(str: string): void {}
export function indexOfString(buf: any, val: any, byteOffset: number): void {}
export function indexOfBuffer(buf: any, val: any, byteOffset: number): void {}
export function indexOfNumber(buf: any, val: any, byteOffset: number): void {}
export function fill(buf: any, val: any, start: number, end: number): void {}
export function readFloatLE(buf: any, offset: number): void {}
export function readFloatBE(buf: any, offset: number): void {}
export function readDoubleLE(buf: any, offset: number): void {}
export function readDoubleBE(buf: any, offset: number): void {}
export function writeFloatLE(buf: any, val: any, offset: number): void {}
export function writeFloatBE(buf: any, val: any, offset: number): void {}
export function writeDoubleLE(buf: any, val: any, offset: number): void {}
export function writeDoubleBE(buf: any, val: any, offset: number): void {}
