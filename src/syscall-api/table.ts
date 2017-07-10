'use strict';

import { syscall } from '../browser-node/syscall';

const ENOSYS = 38;
const AT_FDCWD = -0x64;

// not implemented
function sys_ni_syscall(cb: Function, trap: number): void {
	console.log('ni syscall ' + trap);
	debugger;
	setTimeout(cb, 0, [-1, 0, -ENOSYS]);
}

// rusage size: 144
function sys_wait4(cb: Function, trap: number, pid: number, wstatus: any, options: number, rusage: Uint8Array): void {
	let done = function(pid: number, wstatusIn: number, rusage: any = null): void {
		if (pid > 0)
			wstatus.$set(wstatusIn);
		// TODO: rusage
		cb([pid, 0, 0]);
	};
	syscall.wait4(pid, options, done);
}

function sys_kill(cb: Function, trap: number, pid: number, sig: number): void {
	let done = function(err: any): void {
		cb([err ? -1 : 0, 0, err ? -err : 0]);
	};
	syscall.kill(pid, sig, done);
}

function sys_getpid(cb: Function, trap: number): void {
	let done = function(err: any, pid: number): void {
		cb([pid, 0, 0]);
	};
	syscall.getpid(done);
}

function sys_getppid(cb: Function, trap: number): void {
	let done = function(err: any, pid: number): void {
		cb([pid, 0, 0]);
	};
	syscall.getppid(done);
}

let zeroBuf = new Uint8Array(0);

function sys_spawn(
	cb:    Function,
	trap:  number,
	dir:   any,
	argv0: any,
	argv:  any,
	envv:  any,
	fds:   number[]): void {

	if (!(dir instanceof Uint8Array))
		dir = zeroBuf;
	if (!(argv0 instanceof Uint8Array))
		argv0 = zeroBuf;
	argv = argv.filter((x: any): boolean => x instanceof Uint8Array);
	envv = envv.filter((x: any): boolean => x instanceof Uint8Array);

	let done = function(err: any, pid: number): void {
		cb([err ? -1 : pid, 0, err ? err : 0]);
	};
	// FIXME: use apply to get around string/Uint8Array typing issues for now
	syscall.spawn(dir, argv0, argv, envv, fds, done);
}

function sys_pipe2(cb: Function, trap: number, fds: Int32Array, flags: number): void {
	let done = function(err: any, fd1: number, fd2: number): void {
		if (!err) {
			fds[0] = fd1;
			fds[1] = fd2;
		}
		cb([err ? err : 0, 0, err ? err : 0]);
	};
	syscall.pipe2(flags, done);
}

function sys_getcwd(cb: Function, trap: number, path: Uint8Array, len: number): void {
	let done = function(p: Uint8Array): void {
		path.subarray(0, len).set(p);
		let nullPos = p.length;
		if (nullPos >= path.byteLength)
			nullPos = path.byteLength;
		// XXX: Go expects the kernel to return a null
		// terminated string, hence the null write and +1
		// below.
		path[nullPos] = 0;
		cb([p.length+1, 0, 0]);
	};
	syscall.getcwd(done);
}

function sys_chdir(cb: Function, trap: number, path: any): void {
	let done = function(err: number): void {
		cb([err ? -1 : 0, 0, err ? -err : 0]);
	};
	let len = path.length;
	if (len && path[path.length-1] === 0)
		len--;
	syscall.chdir(path.subarray(0, len), done);
}

function sys_ioctl(cb: Function, trap: number, fd: number, request: any, argp: any): void {
	let done = function(err: any, buf: Uint8Array): void {
		if (!err && argp.byteLength !== undefined)
			argp.set(buf);
		cb([err ? err : buf.byteLength, 0, err ? -1 : 0]);
	};
	syscall.ioctl(fd, request, argp.byteLength, done);
}

function sys_getdents64(cb: Function, trap: number, fd: number, buf: Uint8Array, len: number): void {
	let done = function(err: any, dents: Uint8Array): void {
		if (dents)
			buf.set(dents);
		cb([err, 0, err < 0 ? -1 : 0]);
	};
	syscall.getdents(fd, len, done);
}

function sys_read(cb: Function, trap: number, fd: number, readArray: any, readLen: any): void {
	let done = function(err: any, dataLen: number, data: Uint8Array): void {
		if (!err) {
			for (let i = 0; i < dataLen; i++)
				readArray[i] = data[i];
		}
		cb([dataLen, 0, err ? -1 : 0]);
	};
	syscall.pread(fd, readLen, -1, done);
}

function sys_write(cb: Function, trap: number, fd: number, buf: ArrayBuffer, blen: number): void {
	let done = function(err: any, len: number): void {
		cb([len, 0, err ? -1 : 0]);
	};
	syscall.pwrite(fd, new Uint8Array(buf, 0, blen), -1, done);
}

function sys_stat(cb: Function, trap: number, path: any, buf: Uint8Array): void {
	let done = function(err: any, stats: Uint8Array): void {
		if (!err)
			buf.set(stats);
		cb([err ? -1 : 0, 0, err ? -1 : 0]);
	};
	let len = path.length;
	if (len && path[path.length-1] === 0)
		len--;
	syscall.stat(path.subarray(0, len), done);
}

function sys_lstat(cb: Function, trap: number, path: any, buf: Uint8Array): void {
	let done = function(err: any, stats: any): void {
		if (!err)
			buf.set(stats);
		cb([err ? -1 : 0, 0, err ? -1 : 0]);
	};
	let len = path.length;
	if (len && path[path.length-1] === 0)
		len--;
	syscall.lstat(path.subarray(0, len), done);
}

function sys_fstat(cb: Function, trap: number, fd: number, buf: Uint8Array): void {
	let done = function(err: any, stats: Uint8Array): void {
		if (!err)
			buf.set(stats);
		cb([err ? -1 : 0, 0, err ? -1 : 0]);
	};
	syscall.fstat(fd, done);
}

function sys_readlinkat(cb: Function, trap: number, fd: number, path: Uint8Array, buf: Uint8Array, blen: number): void {
	// TODO: we only support AT_FDCWD
	if (fd !== AT_FDCWD) {
		console.log('openat: TODO: we only support AT_FDCWD');
		setTimeout(cb, 0, [-1, 0, -1]);
		return;
	}
	let done = function(err: any, linkString: Uint8Array): void {
		if (!err)
			buf.set(linkString);
		cb([err ? -1 : linkString.length, 0, err ? -1 : 0]);
	};
	let len = path.length;
	if (len && path[path.length-1] === 0)
		len--;
	syscall.readlink(path.subarray(0, len), done);
}

function sys_openat(cb: Function, trap: number, fd: number, path: Uint8Array, flags: number, mode: number): void {
	// coerce to signed int, to match our constants
	fd = fd|0;

	if (fd !== AT_FDCWD) {
		console.log('openat: TODO: we only support AT_FDCWD');
		setTimeout(cb, 0, [-1, 0, -1]);
		return;
	}
	let done = function(err: any, fd: number): void {
		cb([fd, 0, err ? -1 : 0]);
	};
	let len = path.length;
	if (len && path[path.length-1] === 0)
		len--;
	syscall.open(path.subarray(0, len), flags, mode, done);
}

function sys_close(cb: Function, trap: number, fd: number): void {
	let done = function(err: any): void {
		cb([err ? -1 : 0, 0, err ? -1 : 0]);
	};
	syscall.close(fd, done);
}

function sys_exit_group(cb: Function, trap: number, code: number): void {
	syscall.exit(code);
}

function sys_socket(cb: Function, trap: number, domain: number, type: number, protocol: number): void {
	let done = function(err: any, fd: number): void {
		cb([err ? -1 : fd, 0, err ? -1 : 0]);
	};
	syscall.socket(domain, type, protocol, done);
}

function sys_bind(cb: Function, trap: number, fd: number, buf: Uint8Array, blen: number): void {
	let done = function(err: any): void {
		cb([err ? -1 : 0, 0, err ? -1 : 0]);
	};
	syscall.bind(fd, buf.subarray(0, blen), done);
}

function sys_listen(cb: Function, trap: number, fd: number, backlog: number): void {
	let done = function(err: any): void {
		cb([err ? -1 : 0, 0, err ? -1 : 0]);
	};
	syscall.listen(fd, backlog, done);
}

function sys_connect(cb: Function, trap: number, fd: number, buf: Uint8Array, blen: number): void {
	let done = function(err: any): void {
		cb([err ? -1 : 0, 0, err ? -1 : 0]);
	};
	syscall.connect(fd, buf.subarray(0, blen), done);
}

function sys_getsockname(cb: Function, trap: number, fd: number, buf: Uint8Array, lenp: any): void {
	let done = function(err: any, sockInfo: Uint8Array): void {
		if (!err) {
			buf.set(sockInfo);
			lenp.$set(sockInfo.byteLength);
		}
		cb([err ? -1 : 0, 0, err ? -1 : 0]);
	};

	syscall.getsockname(fd, done);
}

function sys_getpeername(cb: Function, trap: number, fd: number, buf: Uint8Array, lenp: any): void {
	let done = function(err: any, sockInfo: Uint8Array): void {
		if (!err) {
			buf.set(sockInfo);
			lenp.$set(sockInfo.byteLength);
		}
		cb([err ? -1 : 0, 0, err ? -1 : 0]);
	};

	syscall.getpeername(fd, done);
}

function sys_accept4(cb: Function, trap: number, fd: number, buf: Uint8Array, lenp: any): void {
	let done = function(err: any, fd: number, sockInfo: Uint8Array): void {
		buf.set(sockInfo);
		lenp.$set(sockInfo.length);
		cb([err ? -1 : fd, 0, err ? -1 : 0]);
	};
	syscall.accept(fd, done);
}

function sys_setsockopt(cb: Function, trap: number): void {
	// console.log('FIXME: implement setsockopt');
	setTimeout(cb, 0, [0, 0, 0]);
}

export const syscallTbl = [
	sys_read,       // 0 read
	sys_write,      // 1 write
	sys_ni_syscall, // 2 open
	sys_close,      // 3 close
	sys_stat,       // 4 stat
	sys_fstat,      // 5 fstat
	sys_lstat,      // 6 lstat
	sys_ni_syscall, // 7 poll
	sys_ni_syscall, // 8 lseek
	sys_ni_syscall, // 9 mmap
	sys_ni_syscall, // 10 mprotect
	sys_ni_syscall, // 11 munmap
	sys_ni_syscall, // 12 brk
	sys_ni_syscall, // 13 rt_sigaction
	sys_ni_syscall, // 14 rt_sigprocmask
	sys_ni_syscall, // 15 rt_sigreturn
	sys_ioctl,      // 16 ioctl
	sys_ni_syscall, // 17 pread64
	sys_ni_syscall, // 18 pwrite64
	sys_ni_syscall, // 19 readv
	sys_ni_syscall, // 20 writev
	sys_ni_syscall, // 21 access
	sys_ni_syscall, // 22 pipe
	sys_ni_syscall, // 23 select
	sys_ni_syscall, // 24 sched_yield
	sys_ni_syscall, // 25 mremap
	sys_ni_syscall, // 26 msync
	sys_ni_syscall, // 27 mincore
	sys_ni_syscall, // 28 madvise
	sys_ni_syscall, // 29 shmget
	sys_ni_syscall, // 30 shmat
	sys_ni_syscall, // 31 shmctl
	sys_ni_syscall, // 32 dup
	sys_ni_syscall, // 33 dup2
	sys_ni_syscall, // 34 pause
	sys_ni_syscall, // 35 nanosleep
	sys_ni_syscall, // 36 getitimer
	sys_ni_syscall, // 37 alarm
	sys_ni_syscall, // 38 setitimer
	sys_getpid,     // 39 getpid
	sys_ni_syscall, // 40 sendfile
	sys_socket,     // 41 socket
	sys_connect,    // 42 connect
	sys_ni_syscall, // 43 accept
	sys_ni_syscall, // 44 sendto
	sys_ni_syscall, // 45 recvfrom
	sys_ni_syscall, // 46 sendmsg
	sys_ni_syscall, // 47 recvmsg
	sys_ni_syscall, // 48 shutdown
	sys_bind,       // 49 bind
	sys_listen,     // 50 listen
	sys_getsockname, // 51 getsockname
	sys_getpeername, // 52 getpeername
	sys_ni_syscall, // 53 socketpair
	sys_setsockopt, // 54 setsockopt
	sys_ni_syscall, // 55 getsockopt
	sys_ni_syscall, // 56 clone
	sys_ni_syscall, // 57 fork
	sys_ni_syscall, // 58 vfork
	sys_ni_syscall, // 59 execve
	sys_ni_syscall, // 60 exit
	sys_wait4,      // 61 wait4
	sys_kill,       // 62 kill
	sys_ni_syscall, // 63 uname
	sys_ni_syscall, // 64 semget
	sys_ni_syscall, // 65 semop
	sys_ni_syscall, // 66 semctl
	sys_ni_syscall, // 67 shmdt
	sys_ni_syscall, // 68 msgget
	sys_ni_syscall, // 69 msgsnd
	sys_ni_syscall, // 70 msgrcv
	sys_ni_syscall, // 71 msgctl
	sys_ni_syscall, // 72 fcntl
	sys_ni_syscall, // 73 flock
	sys_ni_syscall, // 74 fsync
	sys_ni_syscall, // 75 fdatasync
	sys_ni_syscall, // 76 truncate
	sys_ni_syscall, // 77 ftruncate
	sys_ni_syscall, // 78 getdents
	sys_getcwd,     // 79 getcwd
	sys_chdir,      // 80 chdir
	sys_ni_syscall, // 81 fchdir
	sys_ni_syscall, // 82 rename
	sys_ni_syscall, // 83 mkdir
	sys_ni_syscall, // 84 rmdir
	sys_ni_syscall, // 85 creat
	sys_ni_syscall, // 86 link
	sys_ni_syscall, // 87 unlink
	sys_ni_syscall, // 88 symlink
	sys_ni_syscall, // 89 readlink
	sys_ni_syscall, // 90 chmod
	sys_ni_syscall, // 91 fchmod
	sys_ni_syscall, // 92 chown
	sys_ni_syscall, // 93 fchown
	sys_ni_syscall, // 94 lchown
	sys_ni_syscall, // 95 umask
	sys_ni_syscall, // 96 gettimeofday
	sys_ni_syscall, // 97 getrlimit
	sys_ni_syscall, // 98 getrusage
	sys_ni_syscall, // 99 sysinfo
	sys_ni_syscall, // 100 times
	sys_ni_syscall, // 101 ptrace
	sys_ni_syscall, // 102 getuid
	sys_ni_syscall, // 103 syslog
	sys_ni_syscall, // 104 getgid
	sys_ni_syscall, // 105 setuid
	sys_ni_syscall, // 106 setgid
	sys_ni_syscall, // 107 geteuid
	sys_ni_syscall, // 108 getegid
	sys_ni_syscall, // 109 setpgid
	sys_getppid,    // 110 getppid
	sys_ni_syscall, // 111 getpgrp
	sys_ni_syscall, // 112 setsid
	sys_ni_syscall, // 113 setreuid
	sys_ni_syscall, // 114 setregid
	sys_ni_syscall, // 115 getgroups
	sys_ni_syscall, // 116 setgroups
	sys_ni_syscall, // 117 setresuid
	sys_ni_syscall, // 118 getresuid
	sys_ni_syscall, // 119 setresgid
	sys_ni_syscall, // 120 getresgid
	sys_ni_syscall, // 121 getpgid
	sys_ni_syscall, // 122 setfsuid
	sys_ni_syscall, // 123 setfsgid
	sys_ni_syscall, // 124 getsid
	sys_ni_syscall, // 125 capget
	sys_ni_syscall, // 126 capset
	sys_ni_syscall, // 127 rt_sigpending
	sys_ni_syscall, // 128 rt_sigtimedwait
	sys_ni_syscall, // 129 rt_sigqueueinfo
	sys_ni_syscall, // 130 rt_sigsuspend
	sys_ni_syscall, // 131 sigaltstack
	sys_ni_syscall, // 132 utime
	sys_ni_syscall, // 133 mknod
	sys_ni_syscall, // 134 uselib
	sys_ni_syscall, // 135 personality
	sys_ni_syscall, // 136 ustat
	sys_ni_syscall, // 137 statfs
	sys_ni_syscall, // 138 fstatfs
	sys_ni_syscall, // 139 sysfs
	sys_ni_syscall, // 140 getpriority
	sys_ni_syscall, // 141 setpriority
	sys_ni_syscall, // 142 sched_setparam
	sys_ni_syscall, // 143 sched_getparam
	sys_ni_syscall, // 144 sched_setscheduler
	sys_ni_syscall, // 145 sched_getscheduler
	sys_ni_syscall, // 146 sched_get_priority_max
	sys_ni_syscall, // 147 sched_get_priority_min
	sys_ni_syscall, // 148 sched_rr_get_interval
	sys_ni_syscall, // 149 mlock
	sys_ni_syscall, // 150 munlock
	sys_ni_syscall, // 151 mlockall
	sys_ni_syscall, // 152 munlockall
	sys_ni_syscall, // 153 vhangup
	sys_ni_syscall, // 154 modify_ldt
	sys_ni_syscall, // 155 pivot_root
	sys_ni_syscall, // 156 _sysctl
	sys_ni_syscall, // 157 prctl
	sys_ni_syscall, // 158 arch_prctl
	sys_ni_syscall, // 159 adjtimex
	sys_ni_syscall, // 160 setrlimit
	sys_ni_syscall, // 161 chroot
	sys_ni_syscall, // 162 sync
	sys_ni_syscall, // 163 acct
	sys_ni_syscall, // 164 settimeofday
	sys_ni_syscall, // 165 mount
	sys_ni_syscall, // 166 umount2
	sys_ni_syscall, // 167 swapon
	sys_ni_syscall, // 168 swapoff
	sys_ni_syscall, // 169 reboot
	sys_ni_syscall, // 170 sethostname
	sys_ni_syscall, // 171 setdomainname
	sys_ni_syscall, // 172 iopl
	sys_ni_syscall, // 173 ioperm
	sys_ni_syscall, // 174 create_module
	sys_ni_syscall, // 175 init_module
	sys_ni_syscall, // 176 delete_module
	sys_ni_syscall, // 177 get_kernel_syms
	sys_ni_syscall, // 178 query_module
	sys_ni_syscall, // 179 quotactl
	sys_ni_syscall, // 180 nfsservctl
	sys_ni_syscall, // 181 getpmsg
	sys_ni_syscall, // 182 putpmsg
	sys_ni_syscall, // 183 afs_syscall
	sys_ni_syscall, // 184 tuxcall
	sys_ni_syscall, // 185 security
	sys_ni_syscall, // 186 gettid
	sys_ni_syscall, // 187 readahead
	sys_ni_syscall, // 188 setxattr
	sys_ni_syscall, // 189 lsetxattr
	sys_ni_syscall, // 190 fsetxattr
	sys_ni_syscall, // 191 getxattr
	sys_ni_syscall, // 192 lgetxattr
	sys_ni_syscall, // 193 fgetxattr
	sys_ni_syscall, // 194 listxattr
	sys_ni_syscall, // 195 llistxattr
	sys_ni_syscall, // 196 flistxattr
	sys_ni_syscall, // 197 removexattr
	sys_ni_syscall, // 198 lremovexattr
	sys_ni_syscall, // 199 fremovexattr
	sys_ni_syscall, // 200 tkill
	sys_ni_syscall, // 201 time
	sys_ni_syscall, // 202 futex
	sys_ni_syscall, // 203 sched_setaffinity
	sys_ni_syscall, // 204 sched_getaffinity
	sys_ni_syscall, // 205 set_thread_area
	sys_ni_syscall, // 206 io_setup
	sys_ni_syscall, // 207 io_destroy
	sys_ni_syscall, // 208 io_getevents
	sys_ni_syscall, // 209 io_submit
	sys_ni_syscall, // 210 io_cancel
	sys_ni_syscall, // 211 get_thread_area
	sys_ni_syscall, // 212 lookup_dcookie
	sys_ni_syscall, // 213 epoll_create
	sys_ni_syscall, // 214 epoll_ctl_old
	sys_ni_syscall, // 215 epoll_wait_old
	sys_ni_syscall, // 216 remap_file_pages
	sys_getdents64, // 217 getdents64
	sys_ni_syscall, // 218 set_tid_address
	sys_ni_syscall, // 219 restart_syscall
	sys_ni_syscall, // 220 semtimedop
	sys_ni_syscall, // 221 fadvise64
	sys_ni_syscall, // 222 timer_create
	sys_ni_syscall, // 223 timer_settime
	sys_ni_syscall, // 224 timer_gettime
	sys_ni_syscall, // 225 timer_getoverrun
	sys_ni_syscall, // 226 timer_delete
	sys_ni_syscall, // 227 clock_settime
	sys_ni_syscall, // 228 clock_gettime
	sys_ni_syscall, // 229 clock_getres
	sys_ni_syscall, // 230 clock_nanosleep
	sys_exit_group, // 231 exit_group
	sys_ni_syscall, // 232 epoll_wait
	sys_ni_syscall, // 233 epoll_ctl
	sys_ni_syscall, // 234 tgkill
	sys_ni_syscall, // 235 utimes
	sys_ni_syscall, // 236 vserver
	sys_ni_syscall, // 237 mbind
	sys_ni_syscall, // 238 set_mempolicy
	sys_ni_syscall, // 239 get_mempolicy
	sys_ni_syscall, // 240 mq_open
	sys_ni_syscall, // 241 mq_unlink
	sys_ni_syscall, // 242 mq_timedsend
	sys_ni_syscall, // 243 mq_timedreceive
	sys_ni_syscall, // 244 mq_notify
	sys_ni_syscall, // 245 mq_getsetattr
	sys_ni_syscall, // 246 kexec_load
	sys_ni_syscall, // 247 waitid
	sys_ni_syscall, // 248 add_key
	sys_ni_syscall, // 249 request_key
	sys_ni_syscall, // 250 keyctl
	sys_ni_syscall, // 251 ioprio_set
	sys_ni_syscall, // 252 ioprio_get
	sys_ni_syscall, // 253 inotify_init
	sys_ni_syscall, // 254 inotify_add_watch
	sys_ni_syscall, // 255 inotify_rm_watch
	sys_ni_syscall, // 256 migrate_pages
	sys_openat,     // 257 openat
	sys_ni_syscall, // 258 mkdirat
	sys_ni_syscall, // 259 mknodat
	sys_ni_syscall, // 260 fchownat
	sys_ni_syscall, // 261 futimesat
	sys_ni_syscall, // 262 newfstatat
	sys_ni_syscall, // 263 unlinkat
	sys_ni_syscall, // 264 renameat
	sys_ni_syscall, // 265 linkat
	sys_ni_syscall, // 266 symlinkat
	sys_readlinkat, // 267 readlinkat
	sys_ni_syscall, // 268 fchmodat
	sys_ni_syscall, // 269 faccessat
	sys_ni_syscall, // 270 pselect6
	sys_ni_syscall, // 271 ppoll
	sys_ni_syscall, // 272 unshare
	sys_ni_syscall, // 273 set_robust_list
	sys_ni_syscall, // 274 get_robust_list
	sys_ni_syscall, // 275 splice
	sys_ni_syscall, // 276 tee
	sys_ni_syscall, // 277 sync_file_range
	sys_ni_syscall, // 278 vmsplice
	sys_ni_syscall, // 279 move_pages
	sys_ni_syscall, // 280 utimensat
	sys_ni_syscall, // 281 epoll_pwait
	sys_ni_syscall, // 282 signalfd
	sys_ni_syscall, // 283 timerfd_create
	sys_ni_syscall, // 284 eventfd
	sys_ni_syscall, // 285 fallocate
	sys_ni_syscall, // 286 timerfd_settime
	sys_ni_syscall, // 287 timerfd_gettime
	sys_accept4,    // 288 accept4
	sys_ni_syscall, // 289 signalfd4
	sys_ni_syscall, // 290 eventfd2
	sys_ni_syscall, // 291 epoll_create1
	sys_ni_syscall, // 292 dup3
	sys_pipe2,      // 293 pipe2
	sys_ni_syscall, // 294 inotify_init1
	sys_ni_syscall, // 295 preadv
	sys_ni_syscall, // 296 pwritev
	sys_ni_syscall, // 297 rt_tgsigqueueinfo
	sys_ni_syscall, // 298 perf_event_open
	sys_ni_syscall, // 299 recvmmsg
	sys_ni_syscall, // 300 fanotify_init
	sys_ni_syscall, // 301 fanotify_mark
	sys_ni_syscall, // 302 prlimit64
	sys_ni_syscall, // 303 name_to_handle_at
	sys_ni_syscall, // 304 open_by_handle_at
	sys_ni_syscall, // 305 clock_adjtime
	sys_ni_syscall, // 306 syncfs
	sys_ni_syscall, // 307 sendmmsg
	sys_ni_syscall, // 308 setns
	sys_ni_syscall, // 309 getcpu
	sys_ni_syscall, // 310 process_vm_readv
	sys_ni_syscall, // 311 process_vm_writev
	sys_ni_syscall, // 312 kcmp
	sys_ni_syscall, // 313 finit_module
	sys_ni_syscall, // 314 sched_setattr
	sys_ni_syscall, // 315 sched_getattr
	sys_ni_syscall, // 316 renameat2
	sys_ni_syscall, // 317 seccomp
	sys_ni_syscall, // 318 getrandom
	sys_ni_syscall, // 319 memfd_create
	sys_ni_syscall, // 320 kexec_file_load
	sys_ni_syscall, // 321 bpf
	sys_ni_syscall, // 322 execveat
	sys_ni_syscall, // 323 userfaultfd
	sys_ni_syscall, // 324 membarrier
	sys_ni_syscall, // 325 mlock2
	// Browsix-specific syscalls
	sys_spawn,      // 326 spawn
];
