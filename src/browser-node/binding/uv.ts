'use strict';

import * as constants from './constants';

export const UV_EOF = -0xfff;

export const UV_EAGAIN = constants.EAGAIN;
export const UV_EMFILE = constants.EMFILE;
export const UV_ENFILE = constants.ENFILE;
export const UV_ENOENT = constants.ENOENT;


// enum uv_stdio_flags
export const UV_IGNORE         = 0x00;
export const UV_CREATE_PIPE    = 0x01;
export const UV_INHERIT_FD     = 0x02;
export const UV_INHERIT_STREAM = 0x04;
// When UV_CREATE_PIPE is specified, UV_READABLE_PIPE and
// UV_WRITABLE_PIPE determine the direction of flow, from the child
// process' perspective. Both flags may be specified to create a
// duplex data stream.
export const UV_READABLE_PIPE  = 0x10;
export const UV_WRITABLE_PIPE  = 0x20;


// enum uv_process_flags

// Set the child process' user id. The user id is supplied in the
// `uid` field of the options struct. This does not work on windows;
// setting this flag will cause uv_spawn() to fail.
export const UV_PROCESS_SETUID = (1 << 0);
// Set the child process' group id. The user id is supplied in the
// `gid` field of the options struct. This does not work on windows;
// setting this flag will cause uv_spawn() to fail.
export const UV_PROCESS_SETGID = (1 << 1);
// Do not wrap any arguments in quotes, or perform any other escaping,
// when converting the argument list into a command line string. This
// option is only meaningful on Windows systems. On Unix it is
// silently ignored.
export const UV_PROCESS_WINDOWS_VERBATIM_ARGUMENTS = (1 << 2);
// Spawn the child process in a detached state - this will make it a
// process group leader, and will effectively enable the child to keep
// running after the parent exits.  Note that the child process will
// still keep the parent's event loop alive unless the parent process
// calls uv_unref() on the child's process handle.
export const UV_PROCESS_DETACHED = (1 << 3);
// Hide the subprocess console window that would normally be
// created. This option is only meaningful on Windows systems. On Unix
// it is silently ignored.
export const UV_PROCESS_WINDOWS_HIDE = (1 << 4);


export function errname(arg: any): string {
	// FIXME: actual errname implementation
	return '' + arg;
}
