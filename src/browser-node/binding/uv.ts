'use strict';

import * as constants from './constants';

export const UV_EAGAIN = constants.EAGAIN;
export const UV_EMFILE = constants.EMFILE;
export const UV_ENFILE = constants.ENFILE;
export const UV_ENOENT = constants.ENOENT;

export function errname(arg: any): string {
	// FIXME: actual errname implementation
	return '' + arg;
}
