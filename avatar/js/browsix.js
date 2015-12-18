(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
exports.E2BIG = 7;
exports.EACCES = 13;
exports.EADDRINUSE = 98;
exports.EADDRNOTAVAIL = 99;
exports.EAFNOSUPPORT = 97;
exports.EAGAIN = 11;
exports.EALREADY = 114;
exports.EBADF = 9;
exports.EBADMSG = 74;
exports.EBUSY = 16;
exports.ECANCELED = 125;
exports.ECHILD = 10;
exports.ECONNABORTED = 103;
exports.ECONNREFUSED = 111;
exports.ECONNRESET = 104;
exports.EDEADLK = 35;
exports.EDESTADDRREQ = 89;
exports.EDOM = 33;
exports.EDQUOT = 122;
exports.EEXIST = 17;
exports.EFAULT = 14;
exports.EFBIG = 27;
exports.EHOSTUNREACH = 113;
exports.EIDRM = 43;
exports.EILSEQ = 84;
exports.EINPROGRESS = 115;
exports.EINTR = 4;
exports.EINVAL = 22;
exports.EIO = 5;
exports.EISCONN = 106;
exports.EISDIR = 21;
exports.ELOOP = 40;
exports.EMFILE = 24;
exports.EMLINK = 31;
exports.EMSGSIZE = 90;
exports.EMULTIHOP = 72;
exports.ENAMETOOLONG = 36;
exports.ENETDOWN = 100;
exports.ENETRESET = 102;
exports.ENETUNREACH = 101;
exports.ENFILE = 23;
exports.ENOBUFS = 105;
exports.ENODATA = 61;
exports.ENODEV = 19;
exports.ENOENT = 2;
exports.ENOEXEC = 8;
exports.ENOLCK = 37;
exports.ENOLINK = 67;
exports.ENOMEM = 12;
exports.ENOMSG = 42;
exports.ENOPROTOOPT = 92;
exports.ENOSPC = 28;
exports.ENOSR = 63;
exports.ENOSTR = 60;
exports.ENOSYS = 38;
exports.ENOTCONN = 107;
exports.ENOTDIR = 20;
exports.ENOTEMPTY = 39;
exports.ENOTSOCK = 88;
exports.ENOTSUP = 95;
exports.ENOTTY = 25;
exports.ENXIO = 6;
exports.EOPNOTSUPP = 95;
exports.EOVERFLOW = 75;
exports.EPERM = 1;
exports.EPIPE = 32;
exports.EPROTO = 71;
exports.EPROTONOSUPPORT = 93;
exports.EPROTOTYPE = 91;
exports.ERANGE = 34;
exports.EROFS = 30;
exports.ESPIPE = 29;
exports.ESRCH = 3;
exports.ESTALE = 116;
exports.ETIME = 62;
exports.ETIMEDOUT = 110;
exports.ETXTBSY = 26;
exports.EWOULDBLOCK = 11;
exports.EXDEV = 18;
exports.F_OK = 0;
exports.O_APPEND = 1024;
exports.O_CREAT = 64;
exports.O_DIRECT = 16384;
exports.O_DIRECTORY = 65536;
exports.O_EXCL = 128;
exports.O_NOCTTY = 256;
exports.O_NOFOLLOW = 131072;
exports.O_NONBLOCK = 2048;
exports.O_RDONLY = 0;
exports.O_RDWR = 2;
exports.O_SYNC = 1052672;
exports.O_TRUNC = 512;
exports.O_WRONLY = 1;
exports.R_OK = 4;
exports.SIGABRT = 6;
exports.SIGALRM = 14;
exports.SIGBUS = 7;
exports.SIGCHLD = 17;
exports.SIGCONT = 18;
exports.SIGFPE = 8;
exports.SIGHUP = 1;
exports.SIGILL = 4;
exports.SIGINT = 2;
exports.SIGIO = 29;
exports.SIGIOT = 6;
exports.SIGKILL = 9;
exports.SIGPIPE = 13;
exports.SIGPOLL = 29;
exports.SIGPROF = 27;
exports.SIGPWR = 30;
exports.SIGQUIT = 3;
exports.SIGSEGV = 11;
exports.SIGSTKFLT = 16;
exports.SIGSTOP = 19;
exports.SIGSYS = 31;
exports.SIGTERM = 15;
exports.SIGTRAP = 5;
exports.SIGTSTP = 20;
exports.SIGTTIN = 21;
exports.SIGTTOU = 22;
exports.SIGUNUSED = 31;
exports.SIGURG = 23;
exports.SIGUSR1 = 10;
exports.SIGUSR2 = 12;
exports.SIGVTALRM = 26;
exports.SIGWINCH = 28;
exports.SIGXCPU = 24;
exports.SIGXFSZ = 25;
exports.S_IFBLK = 24576;
exports.S_IFCHR = 8192;
exports.S_IFDIR = 16384;
exports.S_IFIFO = 4096;
exports.S_IFLNK = 40960;
exports.S_IFMT = 61440;
exports.S_IFREG = 32768;
exports.S_IFSOCK = 49152;
exports.S_IRGRP = 32;
exports.S_IROTH = 4;
exports.S_IRUSR = 256;
exports.S_IRWXG = 56;
exports.S_IRWXO = 7;
exports.S_IRWXU = 448;
exports.S_IWGRP = 16;
exports.S_IWOTH = 2;
exports.S_IWUSR = 128;
exports.S_IXGRP = 8;
exports.S_IXOTH = 1;
exports.S_IXUSR = 64;
exports.UV_UDP_REUSEADDR = 4;
exports.W_OK = 2;
exports.X_OK = 1;

},{}],2:[function(require,module,exports){
/// <reference path="../../typings/node/node.d.ts" />
'use strict';
var RegularFile = (function () {
    function RegularFile(kernel, fd) {
        this.kernel = kernel;
        this.fd = fd;
        this.refCount = 1;
    }
    RegularFile.prototype.write = function (buf, cb) {
        var args = Array.prototype.slice.apply(arguments);
        this.kernel.fs.write.apply(this.kernel.fs, [this.fd].concat(args));
    };
    RegularFile.prototype.read = function (buf, pos, len, off, cb) {
        this.kernel.fs.read(this.fd, buf, pos, len, off, cb);
    };
    RegularFile.prototype.stat = function (cb) {
        this.kernel.fs.fstat(this.fd, cb);
    };
    RegularFile.prototype.ref = function () {
        this.refCount++;
    };
    RegularFile.prototype.unref = function () {
        this.refCount--;
        if (!this.refCount) {
            this.kernel.fs.close(this.fd);
            this.fd = undefined;
        }
    };
    return RegularFile;
})();
exports.RegularFile = RegularFile;

},{}],3:[function(require,module,exports){
(function (global){
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/async/async.d.ts" />
/// <reference path="../../typings/dropboxjs/dropboxjs.d.ts" />
'use strict';
var _this = this;
var constants = require('./constants');
var pipe_1 = require('./pipe');
var socket_1 = require('./socket');
var file_1 = require('./file');
var types_1 = require('./types');
var BrowserFS = require('./vendor/BrowserFS/src/core/browserfs');
var DEBUG = false;
var SCHEDULING_DELAY = 0;
var Buffer;
require('./vendor/BrowserFS/src/backend/in_memory');
require('./vendor/BrowserFS/src/backend/XmlHttpRequest');
require('./vendor/BrowserFS/src/backend/overlay');
require('./vendor/BrowserFS/src/backend/async_mirror');
if (typeof setImmediate === 'undefined') {
    var g = global;
    var timeouts = [];
    var messageName = "zero-timeout-message";
    var canUsePostMessage = function () {
        if (typeof g.importScripts !== 'undefined' || !g.postMessage)
            return false;
        var isAsync = true;
        var oldOnMessage = g.onmessage;
        g.onmessage = function () { isAsync = false; };
        g.postMessage('', '*');
        g.onmessage = oldOnMessage;
        return isAsync;
    };
    if (canUsePostMessage()) {
        g.setImmediate = function (fn) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            timeouts.push([fn, args]);
            g.postMessage(messageName, "*");
        };
        var handleMessage = function (event) {
            if (event.source === self && event.data === messageName) {
                if (event.stopPropagation)
                    event.stopPropagation();
                else
                    event.cancelBubble = true;
            }
            if (timeouts.length > 0) {
                var _a = timeouts.shift(), fn = _a[0], args = _a[1];
                return fn.apply(_this, args);
            }
        };
        g.addEventListener('message', handleMessage, true);
        console.log('using postMessage for setImmediate');
    }
    else {
        g.setImmediate = function (fn) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return setTimeout.apply(_this, [fn, 0].concat(args));
        };
    }
}
if (typeof window === 'undefined' || typeof window.Worker === 'undefined')
    var Worker = require('webworker-threads').Worker;
else
    var Worker = window.Worker;
var O_APPEND = constants.O_APPEND || 0;
var O_CREAT = constants.O_CREAT || 0;
var O_EXCL = constants.O_EXCL || 0;
var O_RDONLY = constants.O_RDONLY || 0;
var O_RDWR = constants.O_RDWR || 0;
var O_SYNC = constants.O_SYNC || 0;
var O_TRUNC = constants.O_TRUNC || 0;
var O_WRONLY = constants.O_WRONLY || 0;
var PRIO_MIN = -20;
var PRIO_MAX = 20;
var O_CLOEXEC = 0x80000;
function flagsToString(flag) {
    'use strict';
    if (typeof flag !== 'number') {
        return flag;
    }
    flag &= ~O_CLOEXEC;
    switch (flag) {
        case O_RDONLY:
            return 'r';
        case O_RDONLY | O_SYNC:
            return 'rs';
        case O_RDWR:
            return 'r+';
        case O_RDWR | O_SYNC:
            return 'rs+';
        case O_TRUNC | O_CREAT | O_WRONLY:
            return 'w';
        case O_TRUNC | O_CREAT | O_WRONLY | O_EXCL:
            return 'wx';
        case O_TRUNC | O_CREAT | O_RDWR:
            return 'w+';
        case O_TRUNC | O_CREAT | O_RDWR | O_EXCL:
            return 'wx+';
        case O_APPEND | O_CREAT | O_WRONLY:
            return 'a';
        case O_APPEND | O_CREAT | O_WRONLY | O_EXCL:
            return 'ax';
        case O_APPEND | O_CREAT | O_RDWR:
            return 'a+';
        case O_APPEND | O_CREAT | O_RDWR | O_EXCL:
            return 'ax+';
    }
    throw new Error('Unknown file open flag: ' + flag);
}
(function (AF) {
    AF[AF["UNSPEC"] = 0] = "UNSPEC";
    AF[AF["LOCAL"] = 1] = "LOCAL";
    AF[AF["UNIX"] = 1] = "UNIX";
    AF[AF["FILE"] = 1] = "FILE";
    AF[AF["INET"] = 2] = "INET";
    AF[AF["INET6"] = 10] = "INET6";
})(exports.AF || (exports.AF = {}));
var AF = exports.AF;
;
(function (SOCK) {
    SOCK[SOCK["STREAM"] = 1] = "STREAM";
    SOCK[SOCK["DGRAM"] = 2] = "DGRAM";
})(exports.SOCK || (exports.SOCK = {}));
var SOCK = exports.SOCK;
var Syscalls = (function () {
    function Syscalls(kernel) {
        this.kernel = kernel;
    }
    Syscalls.prototype.getcwd = function (ctx) {
        ctx.complete(ctx.task.cwd);
    };
    Syscalls.prototype.exit = function (ctx, code) {
        if (!code)
            code = 0;
        this.kernel.exit(ctx.task, code);
    };
    Syscalls.prototype.socket = function (ctx, domain, type, protocol) {
        if (domain !== AF.INET && type !== SOCK.STREAM)
            return ctx.complete('unsupported socket type');
        var f = new socket_1.SocketFile(ctx.task);
        var n = ctx.task.addFile(f);
        ctx.complete(undefined, n);
    };
    Syscalls.prototype.bind = function (ctx, fd, addr, port) {
        var file = ctx.task.files[fd];
        if (!file) {
            ctx.complete('bad FD ' + fd, null);
            return;
        }
        if (socket_1.isSocket(file)) {
            ctx.complete(this.kernel.bind(file, addr, port));
            return;
        }
        return ctx.complete('ENOTSOCKET');
    };
    Syscalls.prototype.listen = function (ctx, fd, backlog) {
        var file = ctx.task.files[fd];
        if (!file) {
            ctx.complete('bad FD ' + fd, null);
            return;
        }
        if (socket_1.isSocket(file)) {
            file.listen(function (err) {
                ctx.complete(err);
            });
            return;
        }
        return ctx.complete('ENOTSOCKET');
    };
    Syscalls.prototype.accept = function (ctx, fd) {
        var file = ctx.task.files[fd];
        if (!file) {
            ctx.complete('bad FD ' + fd, null);
            return;
        }
        if (socket_1.isSocket(file)) {
            file.accept(function (err, s, remoteAddr, remotePort) {
                if (err)
                    return ctx.complete(err);
                var n = ctx.task.addFile(s);
                ctx.complete(undefined, n, remoteAddr, remotePort);
            });
            return;
        }
        return ctx.complete('ENOTSOCKET');
    };
    Syscalls.prototype.connect = function (ctx, fd, addr, port) {
        var file = ctx.task.files[fd];
        if (!file) {
            ctx.complete('bad FD ' + fd, null);
            return;
        }
        if (socket_1.isSocket(file)) {
            file.connect(addr, port, function (err) {
                ctx.complete(err);
            });
            return;
        }
        return ctx.complete('ENOTSOCKET');
    };
    Syscalls.prototype.spawn = function (ctx, cwd, name, args, env, files) {
        this.kernel.spawn(ctx.task, cwd, name, args, env, files, function (err, pid) {
            ctx.complete(err, pid);
        });
    };
    Syscalls.prototype.pread = function (ctx, fd, len, off) {
        var file = ctx.task.files[fd];
        if (!file) {
            ctx.complete('bad FD ' + fd, null);
            return;
        }
        if (file instanceof pipe_1.Pipe) {
            file.read(ctx, len);
            return;
        }
        if (off === -1)
            off = null;
        var buf = new Buffer(len);
        file.read(buf, 0, len, off, function (err, lenRead) {
            if (err) {
                console.log(err);
                ctx.complete(err, null);
                return;
            }
            ctx.complete(null, lenRead, new Uint8Array(buf.data.buff.buffer, 0, lenRead));
        });
    };
    Syscalls.prototype.pwrite = function (ctx, fd, buf) {
        var file = ctx.task.files[fd];
        if (!file) {
            ctx.complete('bad FD ' + fd, null);
            return;
        }
        if (!(buf instanceof Buffer) && (buf instanceof Uint8Array)) {
            buf = new Buffer(buf.buffer);
            file.write(buf, 0, buf.length, function (err, len) {
                ctx.complete(err, len);
            });
            return;
        }
        file.write(buf, function (err, len) {
            ctx.complete(err, len);
        });
    };
    Syscalls.prototype.pipe2 = function (ctx, flags) {
        var pipe = new pipe_1.Pipe();
        var n1 = ctx.task.addFile(new pipe_1.PipeFile(pipe));
        var n2 = ctx.task.addFile(new pipe_1.PipeFile(pipe));
        ctx.complete(undefined, n1, n2);
    };
    Syscalls.prototype.getpriority = function (ctx, which, who) {
        if (which !== 0 && who !== 0) {
            ctx.complete('NOT_IMPLEMENTED', -1);
            return;
        }
        ctx.complete(undefined, ctx.task.priority);
    };
    Syscalls.prototype.setpriority = function (ctx, which, who, prio) {
        if (which !== 0 && who !== 0) {
            ctx.complete('NOT_IMPLEMENTED', -1);
            return;
        }
        ctx.complete(undefined, ctx.task.setPriority(prio));
    };
    Syscalls.prototype.readdir = function (ctx, path) {
        this.kernel.fs.readdir(path, ctx.complete.bind(ctx));
    };
    Syscalls.prototype.open = function (ctx, path, flags, mode) {
        var _this = this;
        this.kernel.fs.open(path, flagsToString(flags), mode, function (err, fd) {
            if (err) {
                ctx.complete(err, null);
                return;
            }
            var n = ctx.task.addFile(new file_1.RegularFile(_this.kernel, fd));
            ctx.complete(undefined, n);
        });
    };
    Syscalls.prototype.unlink = function (ctx, path) {
        this.kernel.fs.unlink(path, ctx.complete.bind(ctx));
    };
    Syscalls.prototype.utimes = function (ctx, path, atimets, mtimets) {
        var atime = new Date(atimets * 1000);
        var mtime = new Date(mtimets * 1000);
        this.kernel.fs.utimes(path, atime, mtime, ctx.complete.bind(ctx));
    };
    Syscalls.prototype.futimes = function (ctx, fd, atimets, mtimets) {
        var file = ctx.task.files[fd];
        if (!file) {
            ctx.complete('bad FD ' + fd, null);
            return;
        }
        if (file instanceof pipe_1.Pipe) {
            ctx.complete('TODO: futimes on pipe?');
            return;
        }
        var atime = new Date(atimets * 1000);
        var mtime = new Date(mtimets * 1000);
        this.kernel.fs.futimes(file, atime, mtime, ctx.complete.bind(ctx));
    };
    Syscalls.prototype.rmdir = function (ctx, path) {
        this.kernel.fs.rmdir(path, ctx.complete.bind(ctx));
    };
    Syscalls.prototype.mkdir = function (ctx, path, mode) {
        this.kernel.fs.mkdir(path, mode, ctx.complete.bind(ctx));
    };
    Syscalls.prototype.close = function (ctx, fd) {
        var file = ctx.task.files[fd];
        if (!file) {
            ctx.complete('bad FD ' + fd, null);
            return;
        }
        ctx.task.files[fd] = undefined;
        if (file instanceof pipe_1.Pipe) {
            ctx.complete(null, 0);
            file.unref();
            return;
        }
        file.unref();
        ctx.complete(null, 0);
    };
    Syscalls.prototype.fstat = function (ctx, fd) {
        var file = ctx.task.files[fd];
        if (!file) {
            ctx.complete('bad FD ' + fd, null);
            return;
        }
        file.stat(function (err, stats) {
            if (err) {
                console.log(err);
                ctx.complete(err, null);
                return;
            }
            ctx.complete(null, JSON.parse(JSON.stringify(stats)));
        });
    };
    Syscalls.prototype.lstat = function (ctx, path) {
        this.kernel.fs.lstat(path, function (err, stats) {
            if (err) {
                console.log(err);
                ctx.complete(err, null);
                return;
            }
            ctx.complete(null, JSON.parse(JSON.stringify(stats)));
        });
    };
    Syscalls.prototype.stat = function (ctx, path) {
        this.kernel.fs.stat(path, function (err, stats) {
            if (err) {
                console.log(err);
                ctx.complete(err, null);
                return;
            }
            ctx.complete(null, JSON.parse(JSON.stringify(stats)));
        });
    };
    return Syscalls;
})();
var Kernel = (function () {
    function Kernel(fs, nCPUs) {
        this.debug = DEBUG;
        this.ports = {};
        this.tasks = {};
        this.taskIdSeq = 0;
        this.outstanding = 0;
        this.inKernel = 0;
        this.nCPUs = nCPUs;
        this.fs = fs;
        this.syscalls = new Syscalls(this);
        this.runQueues = [];
        for (var i = PRIO_MIN; i < PRIO_MAX; i++) {
            this.runQueues[i - PRIO_MIN] = [];
        }
    }
    Kernel.prototype.schedule = function (task) {
        var prio = task.priority + 20;
        if (prio < 0) {
            console.log('warning: invalid prio: ' + prio);
            prio = 0;
        }
        this.runQueues[prio].push(task);
        setImmediate(this.nextTask.bind(this));
    };
    Kernel.prototype.nextTask = function () {
        if (this.outstanding >= this.nCPUs) {
        }
        for (var i = PRIO_MIN; i < PRIO_MAX; i++) {
            var queue = this.runQueues[i - PRIO_MIN];
            if (!queue.length)
                continue;
            var runnable = queue.shift();
            this.outstanding++;
            this.inKernel--;
            runnable.run();
            break;
        }
    };
    Kernel.prototype.system = function (cmd, onExit, onStdout, onStderr) {
        var _this = this;
        var parts;
        if (cmd.indexOf('|') > -1) {
            parts = ['/usr/bin/sh', cmd];
        }
        else {
            parts = cmd.split(' ');
        }
        if (parts[0][0] !== '/')
            parts[0] = '/usr/bin/' + parts[0];
        var env = [];
        this.spawn(null, '/', parts[0], parts, env, null, function (err, pid) {
            if (err) {
                onExit(-1, -666);
                return;
            }
            var t = _this.tasks[pid];
            t.onExit = onExit;
            t.onStdout = onStdout;
            t.onStderr = onStderr;
        });
    };
    Kernel.prototype.exit = function (task, code) {
        if (task.state === TaskState.Zombie) {
            console.log('warning, got more than 1 exit call from ' + task.pid);
            return;
        }
        task.worker.onmessage = undefined;
        task.exit(code);
        delete this.tasks[task.pid];
        setImmediate(function () {
            task.worker.terminate();
            if (task.parent)
                task.parent.signal('child', [task.pid, code, 0]);
            setImmediate(workerTerminated);
        });
        function workerTerminated() {
            if (!task.onExit)
                return;
            var stdout = task.files[1];
            var stderr = task.files[2];
            if (pipe_1.isPipe(stdout) && task.onStdout)
                task.onStdout(task.pid, stdout.readSync());
            if (pipe_1.isPipe(stderr) && task.onStderr)
                task.onStderr(task.pid, stderr.readSync());
            task.onExit(task.pid, task.exitCode);
        }
    };
    Kernel.prototype.kill = function (pid) {
        if (!(pid in this.tasks))
            return;
        var task = this.tasks[pid];
        this.exit(task, -666);
    };
    Kernel.prototype.bind = function (s, addr, port) {
        if (port in this.ports)
            return 'port ' + port + ' already bound';
        this.ports[port] = s;
        return;
    };
    Kernel.prototype.connect = function (f, addr, port, cb) {
        if (addr !== 'localhost' && addr !== '127.0.0.1')
            return cb('TODO: only localhost connections for now');
        if (!(port in this.ports))
            return cb('unknown port');
        var listener = this.ports[port];
        if (!listener.isListening)
            return cb('remote not listening');
        var local = f;
        listener.doAccept(local, addr, port, cb);
        return;
    };
    Kernel.prototype.doSyscall = function (syscall) {
        setImmediate(this.nextTask.bind(this));
        this.outstanding--;
        if (this.outstanding < 0) {
            this.outstanding = 0;
        }
        else {
        }
        this.inKernel++;
        if (syscall.name in this.syscalls) {
            console.log('sys_' + syscall.name + '\t' + syscall.args[0]);
            this.syscalls[syscall.name].apply(this.syscalls, syscall.callArgs());
        }
        else {
            console.log('unknown syscall ' + syscall.name);
        }
    };
    Kernel.prototype.spawn = function (parent, cwd, name, args, env, files, cb) {
        var pid = this.nextTaskId();
        var task = new Task(this, parent, pid, '/', name, args, env, files, cb);
        this.tasks[pid] = task;
    };
    Kernel.prototype.nextTaskId = function () {
        return ++this.taskIdSeq;
    };
    return Kernel;
})();
exports.Kernel = Kernel;
(function (TaskState) {
    TaskState[TaskState["Starting"] = 0] = "Starting";
    TaskState[TaskState["Running"] = 1] = "Running";
    TaskState[TaskState["Interruptable"] = 2] = "Interruptable";
    TaskState[TaskState["Zombie"] = 3] = "Zombie";
})(exports.TaskState || (exports.TaskState = {}));
var TaskState = exports.TaskState;
var Task = (function () {
    function Task(kernel, parent, pid, cwd, filename, args, env, files, cb) {
        //console.log('spawn PID ' + pid + ': ' + args.join(' '));
        this.files = {};
        this.msgIdSeq = 1;
        this.pendingSignals = [];
        this.pendingResults = [];
        this.state = TaskState.Starting;
        this.pid = pid;
        this.parent = parent;
        this.kernel = kernel;
        this.exePath = filename;
        this.exeFd = null;
        this.args = args;
        this.env = env || [];
        this.cwd = cwd;
        this.priority = 0;
        if (parent)
            this.priority = parent.priority;
        if (files && parent) {
            for (var i = 0; i < files.length; i++) {
                if (!(i in parent.files))
                    break;
                this.files[i] = parent.files[files[i]];
                this.files[i].ref();
            }
        }
        else {
            this.files[0] = new pipe_1.PipeFile();
            this.files[1] = new pipe_1.PipeFile();
            this.files[2] = new pipe_1.PipeFile();
        }
        this.onRunnable = cb;
        kernel.fs.open(filename, 'r', this.fileOpened.bind(this));
    }
    Task.prototype.addFile = function (f) {
        var n = Object.keys(this.files).length;
        this.files[n] = f;
        return n;
    };
    Task.prototype.fileOpened = function (err, fd) {
        var _this = this;
        if (err) {
            this.onRunnable(err, undefined);
            this.onRunnable = undefined;
            return;
        }
        this.exeFd = fd;
        this.kernel.fs.fstat(fd, function (serr, stats) {
            if (serr) {
                _this.onRunnable(serr, undefined);
                _this.onRunnable = undefined;
                return;
            }
            var buf = new Buffer(stats.size);
            _this.kernel.fs.read(fd, buf, 0, stats.size, 0, _this.fileRead.bind(_this));
        });
    };
    Task.prototype.fileRead = function (err, bytesRead, buf) {
        if (err) {
            this.onRunnable(err, undefined);
            this.onRunnable = undefined;
            return;
        }
        if (bytesRead > 2 && buf.readUInt8(0) === 0x23 && buf.readUInt8(1) === 0x21) {
            var newlinePos = buf.indexOf('\n');
            if (newlinePos < 0)
                throw new Error('shebang with no newline: ' + buf);
            var shebang = buf.slice(2, newlinePos).toString();
            buf = buf.slice(newlinePos + 1);
            var parts = shebang.match(/\S+/g);
            var cmd = parts[0];
            if (parts.length === 2 && (parts[0] === '/usr/bin/env' || parts[0] === '/bin/env'))
                cmd = '/usr/bin/' + parts[1];
            this.args = [cmd].concat(this.args);
            this.kernel.fs.open(cmd, 'r', this.fileOpened.bind(this));
            return;
        }
        var blob = new Blob([buf.toString()], { type: 'text/javascript' });
        this.worker = new Worker(window.URL.createObjectURL(blob));
        this.worker.onmessage = this.syscallHandler.bind(this);
        this.signal('init', [this.args, this.env]);
        this.onRunnable(null, this.pid);
        this.onRunnable = undefined;
    };
    Task.prototype.setPriority = function (prio) {
        this.priority += prio;
        if (this.priority < PRIO_MIN)
            this.priority = PRIO_MIN;
        if (this.priority >= PRIO_MAX)
            this.priority = PRIO_MAX - 1;
        return 0;
    };
    Task.prototype.signal = function (name, args) {
        var _this = this;
        var timeout = 0;
        if (this.kernel.debug && name === 'init' && this.exePath !== '/usr/bin/sh')
            timeout = 6000;
        self.setImmediate(function () {
            _this.pendingSignals.push({
                id: -1,
                name: name,
                args: args,
            });
            _this.run();
        });
    };
    Task.prototype.schedule = function (msg) {
        var _this = this;
        this.pendingResults.push(msg);
        self.setImmediate(function () {
            _this.kernel.schedule(_this);
        });
    };
    Task.prototype.run = function () {
        this.account();
        this.state = TaskState.Running;
        if (this.pendingSignals.length) {
            var msg = this.pendingSignals.shift();
            this.worker.postMessage(msg);
            if (this.pendingSignals.length || this.pendingResults.length)
                this.kernel.schedule(this);
        }
        if (this.pendingResults.length) {
            var msg = this.pendingResults.shift();
            this.worker.postMessage(msg);
            if (this.pendingSignals.length || this.pendingResults.length)
                this.kernel.schedule(this);
            return;
        }
    };
    Task.prototype.account = function () {
    };
    Task.prototype.exit = function (code) {
        this.state = TaskState.Zombie;
        this.exitCode = code;
        for (var n in this.files) {
            if (!this.files.hasOwnProperty(n))
                continue;
            if (this.files[n])
                this.files[n].unref();
        }
    };
    Task.prototype.nextMsgId = function () {
        return ++this.msgIdSeq;
    };
    Task.prototype.syscallHandler = function (ev) {
        var syscall = types_1.Syscall.From(this, ev);
        if (!syscall) {
            console.log('bad syscall message, dropping');
            return;
        }
        this.account();
        if (this.state !== TaskState.Running) {
        }
        this.state = TaskState.Interruptable;
        this.kernel.doSyscall(syscall);
    };
    return Task;
})();
exports.Task = Task;
var origXhrOpen = window.XMLHttpRequest.prototype.open;
function xhrOpenHook(method, path, flag) {
    if (method === 'GET' && (path.indexOf('localhost') > -1 || path.indexOf('127.0.0.1') > -1)) {
        this.$hooked = true;
        this.$path = path;
        return;
    }
    return origXhrOpen.apply(this, arguments);
}
var origXhrSend = window.XMLHttpRequest.prototype.send;
function xhrSendHook() {
    if (!this.$hooked)
        return origXhrSend.apply(this, arguments);
    var self = this;
    var stdout = null;
    var stderr = '';
    window.kernel.system('curl ' + this.$path, onExit, onStdout, onStderr);
    function onStdout(pid, out) {
        stdout = out[1];
    }
    function onStderr(pid, out) {
        stderr += out[0];
    }
    function onExit(pid, code) {
        self.onload(code === 0 ? null : 'err: ' + stderr, stdout);
    }
}
window.XMLHttpRequest.prototype.open = xhrOpenHook;
window.XMLHttpRequest.prototype.send = xhrSendHook;
function Boot(fsType, fsArgs, cb) {
    'use strict';
    var nCPUs = 1;
    var bfs = {};
    BrowserFS.install(bfs);
    Buffer = bfs.Buffer;
    window.Buffer = Buffer;
    var rootConstructor = BrowserFS.FileSystem[fsType];
    if (!rootConstructor) {
        setImmediate(cb, 'unknown FileSystem type: ' + fsType);
        return;
    }
    var asyncRoot = new (Function.prototype.bind.apply(rootConstructor, [null].concat(fsArgs)));
    var syncRoot = new BrowserFS.FileSystem['InMemory']();
    var root = new BrowserFS.FileSystem['AsyncMirrorFS'](syncRoot, asyncRoot);
    root.initialize(function (err) {
        if (err) {
            cb(err, undefined);
            return;
        }
        var writable = new BrowserFS.FileSystem['InMemory']();
        var overlaid = new BrowserFS.FileSystem['OverlayFS'](writable, root);
        overlaid.initialize(function (errInner) {
            if (errInner) {
                cb(errInner, undefined);
                return;
            }
            BrowserFS.initialize(overlaid);
            var fs = bfs.require('fs');
            var k = new Kernel(fs, nCPUs);
            window.kernel = k;
            setImmediate(cb, null, k);
        });
    });
}
exports.Boot = Boot;
if (typeof window !== 'undefined')
    window.Boot = Boot;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./constants":1,"./file":2,"./pipe":4,"./socket":5,"./types":6,"./vendor/BrowserFS/src/backend/XmlHttpRequest":7,"./vendor/BrowserFS/src/backend/async_mirror":8,"./vendor/BrowserFS/src/backend/in_memory":9,"./vendor/BrowserFS/src/backend/overlay":10,"./vendor/BrowserFS/src/core/browserfs":12,"webworker-threads":undefined}],4:[function(require,module,exports){
/// <reference path="../../typings/node/node.d.ts" />
'use strict';
var Pipe = (function () {
    function Pipe() {
        this.buf = new Buffer(0);
        this.refcount = 1;
        this.waiter = undefined;
        this.closed = false;
    }
    Pipe.prototype.write = function (s) {
        var b = new Buffer(s);
        return this.writeBuffer(b);
    };
    Pipe.prototype.writeBuffer = function (b) {
        this.buf = Buffer.concat([this.buf, b]);
        if (this.waiter) {
            var waiter = this.waiter;
            this.waiter = undefined;
            setTimeout(waiter, 0);
        }
        return b.length;
    };
    Pipe.prototype.read = function (buf, pos, len, off, cb) {
        var _this = this;
        if (this.buf.length || this.closed) {
            var n = this.buf.copy(buf, off, pos, pos + len);
            if (this.buf.length === pos + n)
                this.buf = new Buffer(0);
            else
                this.buf = this.buf.slice(pos + n);
            return cb(undefined, n);
        }
        this.waiter = function () {
            var n = _this.buf.copy(buf, off, pos, pos + len);
            if (_this.buf.length === pos + n)
                _this.buf = new Buffer(0);
            else
                _this.buf = _this.buf.slice(pos + n);
            return cb(undefined, n);
        };
    };
    Pipe.prototype.readSync = function () {
        return [this.buf.toString('utf-8'), new Uint8Array(this.buf.data.buff.buffer)];
    };
    Pipe.prototype.ref = function () {
        this.refcount++;
    };
    Pipe.prototype.unref = function () {
        this.refcount--;
        if (this.refcount)
            return;
        this.closed = true;
        if (!this.waiter)
            return;
        this.waiter();
        this.waiter = undefined;
    };
    return Pipe;
})();
exports.Pipe = Pipe;
function isPipe(f) {
    return f instanceof PipeFile;
}
exports.isPipe = isPipe;
var PipeFile = (function () {
    function PipeFile(pipe) {
        if (!pipe)
            pipe = new Pipe();
        this.pipe = pipe;
    }
    PipeFile.prototype.write = function (buf, cb) {
        if (typeof buf === 'string')
            this.pipe.write(buf);
        else
            this.pipe.writeBuffer(buf);
        cb = arguments[arguments.length - 1];
        cb(undefined, buf.length);
    };
    PipeFile.prototype.read = function (buf, pos, len, off, cb) {
        this.pipe.read(buf, pos, len, off, cb);
    };
    PipeFile.prototype.stat = function (cb) {
        throw new Error('TODO: PipeFile.stat not implemented');
    };
    PipeFile.prototype.readSync = function () {
        return this.pipe.readSync();
    };
    PipeFile.prototype.ref = function () {
        this.pipe.ref();
    };
    PipeFile.prototype.unref = function () {
        this.pipe.unref();
    };
    return PipeFile;
})();
exports.PipeFile = PipeFile;

},{}],5:[function(require,module,exports){
/// <reference path="../../typings/node/node.d.ts" />
'use strict';
var pipe_1 = require('./pipe');
function isSocket(f) {
    return f instanceof SocketFile;
}
exports.isSocket = isSocket;
var SocketFile = (function () {
    function SocketFile(task) {
        this.isListening = false;
        this.parent = undefined;
        this.outgoing = undefined;
        this.incoming = undefined;
        this.incomingQueue = [];
        this.acceptQueue = [];
        this.task = task;
    }
    SocketFile.prototype.stat = function (cb) {
        throw new Error('TODO: SocketFile.stat not implemented');
    };
    SocketFile.prototype.listen = function (cb) {
        this.isListening = true;
        cb(undefined);
    };
    SocketFile.prototype.accept = function (cb) {
        if (!this.incomingQueue.length) {
            this.acceptQueue.push(cb);
            return;
        }
        var queued = this.incomingQueue.shift();
        var remote = queued.s;
        var local = new SocketFile(this.task);
        var outgoing = new pipe_1.Pipe();
        var incoming = new pipe_1.Pipe();
        local.outgoing = outgoing;
        remote.incoming = outgoing;
        local.incoming = incoming;
        remote.outgoing = incoming;
        cb(null, local, queued.addr, queued.port);
        queued.cb(null);
    };
    SocketFile.prototype.doAccept = function (remote, remoteAddr, remotePort, cb) {
        if (!this.acceptQueue.length) {
            this.incomingQueue.push({
                s: remote,
                addr: remoteAddr,
                port: remotePort,
                cb: cb,
            });
            return;
        }
        var acceptCB = this.acceptQueue.shift();
        var local = new SocketFile(this.task);
        var outgoing = new pipe_1.Pipe();
        var incoming = new pipe_1.Pipe();
        local.outgoing = outgoing;
        remote.incoming = outgoing;
        local.incoming = incoming;
        remote.outgoing = incoming;
        acceptCB(null, local, remoteAddr, remotePort);
        cb(null);
    };
    SocketFile.prototype.connect = function (addr, port, cb) {
        this.task.kernel.connect(this, addr, port, cb);
    };
    SocketFile.prototype.write = function (buf, cb) {
        if (typeof buf === 'string')
            this.outgoing.write(buf);
        else
            this.outgoing.writeBuffer(buf);
        cb = arguments[arguments.length - 1];
        cb(undefined, buf.length);
    };
    SocketFile.prototype.read = function (buf, pos, len, off, cb) {
        this.incoming.read(buf, pos, len, off, cb);
    };
    SocketFile.prototype.readSync = function () {
        return this.incoming.readSync();
    };
    SocketFile.prototype.ref = function () {
        if (this.outgoing)
            this.outgoing.ref();
        if (this.incoming)
            this.incoming.ref();
    };
    SocketFile.prototype.unref = function () {
        if (this.outgoing)
            this.outgoing.unref();
        if (this.incoming)
            this.incoming.unref();
    };
    return SocketFile;
})();
exports.SocketFile = SocketFile;

},{"./pipe":4}],6:[function(require,module,exports){
/// <reference path="../../typings/node/node.d.ts" />
'use strict';
var SyscallContext = (function () {
    function SyscallContext(task, id) {
        this.task = task;
        this.id = id;
    }
    SyscallContext.prototype.complete = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        this.task.schedule({
            id: this.id,
            name: undefined,
            args: args,
        });
    };
    return SyscallContext;
})();
exports.SyscallContext = SyscallContext;
var Syscall = (function () {
    function Syscall(ctx, name, args) {
        this.ctx = ctx;
        this.name = name;
        this.args = args;
    }
    Syscall.From = function (task, ev) {
        if (!ev.data)
            return;
        for (var i = 0; i < Syscall.requiredOnData.length; i++) {
            if (!ev.data.hasOwnProperty(Syscall.requiredOnData[i]))
                return;
        }
        var ctx = new SyscallContext(task, ev.data.id);
        return new Syscall(ctx, ev.data.name, ev.data.args);
    };
    Syscall.prototype.callArgs = function () {
        return [this.ctx].concat(this.args);
    };
    Syscall.requiredOnData = ['id', 'name', 'args'];
    return Syscall;
})();
exports.Syscall = Syscall;

},{}],7:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var file_system = require('../core/file_system');
var file_index = require('../generic/file_index');
var buffer = require('../core/buffer');
var api_error = require('../core/api_error');
var file_flag = require('../core/file_flag');
var preload_file = require('../generic/preload_file');
var browserfs = require('../core/browserfs');
var xhr = require('../generic/xhr');
var Buffer = buffer.Buffer;
var ApiError = api_error.ApiError;
var ErrorCode = api_error.ErrorCode;
var FileFlag = file_flag.FileFlag;
var ActionType = file_flag.ActionType;
var XmlHttpRequest = (function (_super) {
    __extends(XmlHttpRequest, _super);
    function XmlHttpRequest(listing_url, prefix_url, asyncOnly) {
        if (prefix_url === void 0) { prefix_url = ''; }
        if (asyncOnly === void 0) { asyncOnly = false; }
        _super.call(this);
        if (listing_url == null) {
            listing_url = 'index.json';
        }
        if (prefix_url.length > 0 && prefix_url.charAt(prefix_url.length - 1) !== '/') {
            prefix_url = prefix_url + '/';
        }
        this.prefix_url = prefix_url;
        var listing = this._requestFileSync(listing_url, 'json');
        if (listing == null) {
            throw new Error("Unable to find listing at URL: " + listing_url);
        }
        this._index = file_index.FileIndex.from_listing(listing);
        this._asyncOnly = asyncOnly;
    }
    XmlHttpRequest.prototype.empty = function () {
        this._index.fileIterator(function (file) {
            file.file_data = null;
        });
    };
    XmlHttpRequest.prototype.getXhrPath = function (filePath) {
        if (filePath.charAt(0) === '/') {
            filePath = filePath.slice(1);
        }
        return this.prefix_url + filePath;
    };
    XmlHttpRequest.prototype._requestFileSizeAsync = function (path, cb) {
        xhr.getFileSizeAsync(this.getXhrPath(path), cb);
    };
    XmlHttpRequest.prototype._requestFileSizeSync = function (path) {
        return xhr.getFileSizeSync(this.getXhrPath(path));
    };
    XmlHttpRequest.prototype._requestFileAsync = function (p, type, cb) {
        xhr.asyncDownloadFile(this.getXhrPath(p), type, cb);
    };
    XmlHttpRequest.prototype._requestFileSync = function (p, type) {
        return xhr.syncDownloadFile(this.getXhrPath(p), type);
    };
    XmlHttpRequest.prototype.getName = function () {
        return 'XmlHttpRequest';
    };
    XmlHttpRequest.isAvailable = function () {
        return typeof XMLHttpRequest !== "undefined" && XMLHttpRequest !== null;
    };
    XmlHttpRequest.prototype.diskSpace = function (path, cb) {
        cb(0, 0);
    };
    XmlHttpRequest.prototype.isReadOnly = function () {
        return true;
    };
    XmlHttpRequest.prototype.supportsLinks = function () {
        return false;
    };
    XmlHttpRequest.prototype.supportsProps = function () {
        return false;
    };
    XmlHttpRequest.prototype.supportsSynch = function () {
        return !this._asyncOnly;
    };
    XmlHttpRequest.prototype.preloadFile = function (path, buffer) {
        var inode = this._index.getInode(path);
        if (inode === null) {
            throw ApiError.ENOENT(path);
        }
        var stats = inode.getData();
        stats.size = buffer.length;
        stats.file_data = buffer;
    };
    XmlHttpRequest.prototype.stat = function (path, isLstat, cb) {
        var inode = this._index.getInode(path);
        if (inode === null) {
            return cb(ApiError.ENOENT(path));
        }
        var stats;
        if (inode.isFile()) {
            stats = inode.getData();
            if (stats.size < 0) {
                this._requestFileSizeAsync(path, function (e, size) {
                    if (e) {
                        return cb(e);
                    }
                    stats.size = size;
                    cb(null, stats.clone());
                });
            }
            else {
                cb(null, stats.clone());
            }
        }
        else {
            stats = inode.getStats();
            cb(null, stats);
        }
    };
    XmlHttpRequest.prototype.statSync = function (path, isLstat) {
        var inode = this._index.getInode(path);
        if (inode === null) {
            throw ApiError.ENOENT(path);
        }
        var stats;
        if (inode.isFile()) {
            stats = inode.getData();
            if (stats.size < 0) {
                stats.size = this._requestFileSizeSync(path);
            }
        }
        else {
            stats = inode.getStats();
        }
        return stats;
    };
    XmlHttpRequest.prototype.open = function (path, flags, mode, cb) {
        if (flags.isWriteable()) {
            return cb(new ApiError(ErrorCode.EPERM, path));
        }
        var _this = this;
        var inode = this._index.getInode(path);
        if (inode === null) {
            return cb(ApiError.ENOENT(path));
        }
        if (inode.isDir()) {
            return cb(ApiError.EISDIR(path));
        }
        var stats = inode.getData();
        switch (flags.pathExistsAction()) {
            case ActionType.THROW_EXCEPTION:
            case ActionType.TRUNCATE_FILE:
                return cb(ApiError.EEXIST(path));
            case ActionType.NOP:
                if (stats.file_data != null) {
                    return cb(null, new preload_file.NoSyncFile(_this, path, flags, stats.clone(), stats.file_data));
                }
                this._requestFileAsync(path, 'buffer', function (err, buffer) {
                    if (err) {
                        return cb(err);
                    }
                    stats.size = buffer.length;
                    stats.file_data = buffer;
                    return cb(null, new preload_file.NoSyncFile(_this, path, flags, stats.clone(), buffer));
                });
                break;
            default:
                return cb(new ApiError(ErrorCode.EINVAL, 'Invalid FileMode object.'));
        }
    };
    XmlHttpRequest.prototype.openSync = function (path, flags, mode) {
        if (flags.isWriteable()) {
            throw new ApiError(ErrorCode.EPERM, path);
        }
        var inode = this._index.getInode(path);
        if (inode === null) {
            throw ApiError.ENOENT(path);
        }
        if (inode.isDir()) {
            throw ApiError.EISDIR(path);
        }
        var stats = inode.getData();
        switch (flags.pathExistsAction()) {
            case ActionType.THROW_EXCEPTION:
            case ActionType.TRUNCATE_FILE:
                throw ApiError.EEXIST(path);
            case ActionType.NOP:
                if (stats.file_data != null) {
                    return new preload_file.NoSyncFile(this, path, flags, stats.clone(), stats.file_data);
                }
                var buffer = this._requestFileSync(path, 'buffer');
                stats.size = buffer.length;
                stats.file_data = buffer;
                return new preload_file.NoSyncFile(this, path, flags, stats.clone(), buffer);
            default:
                throw new ApiError(ErrorCode.EINVAL, 'Invalid FileMode object.');
        }
    };
    XmlHttpRequest.prototype.readdir = function (path, cb) {
        try {
            cb(null, this.readdirSync(path));
        }
        catch (e) {
            cb(e);
        }
    };
    XmlHttpRequest.prototype.readdirSync = function (path) {
        var inode = this._index.getInode(path);
        if (inode === null) {
            throw ApiError.ENOENT(path);
        }
        else if (inode.isFile()) {
            throw ApiError.ENOTDIR(path);
        }
        return inode.getListing();
    };
    XmlHttpRequest.prototype.readFile = function (fname, encoding, flag, cb) {
        var oldCb = cb;
        this.open(fname, flag, 0x1a4, function (err, fd) {
            if (err) {
                return cb(err);
            }
            cb = function (err, arg) {
                fd.close(function (err2) {
                    if (err == null) {
                        err = err2;
                    }
                    return oldCb(err, arg);
                });
            };
            var fdCast = fd;
            var fdBuff = fdCast.getBuffer();
            if (encoding === null) {
                if (fdBuff.length > 0) {
                    return cb(err, fdBuff.sliceCopy());
                }
                else {
                    return cb(err, new buffer.Buffer(0));
                }
            }
            try {
                cb(null, fdBuff.toString(encoding));
            }
            catch (e) {
                cb(e);
            }
        });
    };
    XmlHttpRequest.prototype.readFileSync = function (fname, encoding, flag) {
        var fd = this.openSync(fname, flag, 0x1a4);
        try {
            var fdCast = fd;
            var fdBuff = fdCast.getBuffer();
            if (encoding === null) {
                if (fdBuff.length > 0) {
                    return fdBuff.sliceCopy();
                }
                else {
                    return new buffer.Buffer(0);
                }
            }
            return fdBuff.toString(encoding);
        }
        finally {
            fd.closeSync();
        }
    };
    return XmlHttpRequest;
})(file_system.BaseFileSystem);
exports.XmlHttpRequest = XmlHttpRequest;
browserfs.registerFileSystem('XmlHttpRequest', XmlHttpRequest);

},{"../core/api_error":11,"../core/browserfs":12,"../core/buffer":13,"../core/file_flag":19,"../core/file_system":20,"../generic/file_index":28,"../generic/preload_file":31,"../generic/xhr":32}],8:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var file_system = require('../core/file_system');
var file_flag = require('../core/file_flag');
var preload_file = require('../generic/preload_file');
var browserfs = require('../core/browserfs');
var path = require('../core/node_path');
var MirrorFile = (function (_super) {
    __extends(MirrorFile, _super);
    function MirrorFile(fs, path, flag, stat, data) {
        _super.call(this, fs, path, flag, stat, data);
    }
    MirrorFile.prototype.syncSync = function () {
        if (this.isDirty()) {
            this._fs._syncSync(this);
            this.resetDirty();
        }
    };
    MirrorFile.prototype.closeSync = function () {
        this.syncSync();
    };
    return MirrorFile;
})(preload_file.PreloadFile);
var AsyncMirrorFS = (function (_super) {
    __extends(AsyncMirrorFS, _super);
    function AsyncMirrorFS(sync, async) {
        _super.call(this);
        this._queue = [];
        this._queueRunning = false;
        this._isInitialized = false;
        this._sync = sync;
        this._async = async;
        if (!sync.supportsSynch()) {
            throw new Error("Expected synchronous storage.");
        }
        if (async.supportsSynch()) {
            throw new Error("Expected asynchronous storage.");
        }
    }
    AsyncMirrorFS.prototype.getName = function () {
        return "AsyncMirror";
    };
    AsyncMirrorFS.isAvailable = function () {
        return true;
    };
    AsyncMirrorFS.prototype._syncSync = function (fd) {
        this._sync.writeFileSync(fd.getPath(), fd.getBuffer(), null, file_flag.FileFlag.getFileFlag('w'), fd.getStats().mode);
        this.enqueueOp({
            apiMethod: 'writeFile',
            arguments: [fd.getPath(), fd.getBuffer(), null, fd.getFlag(), fd.getStats().mode]
        });
    };
    AsyncMirrorFS.prototype.initialize = function (finalCb) {
        var _this = this;
        if (!this._isInitialized) {
            var copyDirectory = function (p, mode, cb) {
                if (p !== '/') {
                    _this._sync.mkdirSync(p, mode);
                }
                _this._async.readdir(p, function (err, files) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        var i = 0;
                        function copyNextFile(err) {
                            if (err) {
                                cb(err);
                            }
                            else if (i < files.length) {
                                copyItem(path.join(p, files[i]), copyNextFile);
                                i++;
                            }
                            else {
                                cb();
                            }
                        }
                        copyNextFile();
                    }
                });
            };
            var copyFile = function (p, mode, cb) {
                _this._async.readFile(p, null, file_flag.FileFlag.getFileFlag('r'), function (err, data) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        try {
                            _this._sync.writeFileSync(p, data, null, file_flag.FileFlag.getFileFlag('w'), mode);
                        }
                        catch (e) {
                            err = e;
                        }
                        finally {
                            cb(err);
                        }
                    }
                });
            };
            var copyItem = function (p, cb) {
                _this._async.stat(p, false, function (err, stats) {
                    if (err) {
                        cb(err);
                    }
                    else if (stats.isDirectory()) {
                        copyDirectory(p, stats.mode, cb);
                    }
                    else {
                        copyFile(p, stats.mode, cb);
                    }
                });
            };
            copyDirectory('/', 0, function (err) {
                if (err) {
                    finalCb(err);
                }
                else {
                    _this._isInitialized = true;
                    finalCb();
                }
            });
        }
        else {
            finalCb();
        }
    };
    AsyncMirrorFS.prototype.isReadOnly = function () { return false; };
    AsyncMirrorFS.prototype.supportsSynch = function () { return true; };
    AsyncMirrorFS.prototype.supportsLinks = function () { return false; };
    AsyncMirrorFS.prototype.supportsProps = function () { return this._sync.supportsProps() && this._async.supportsProps(); };
    AsyncMirrorFS.prototype.enqueueOp = function (op) {
        var _this = this;
        this._queue.push(op);
        if (!this._queueRunning) {
            this._queueRunning = true;
            var doNextOp = function (err) {
                if (err) {
                    console.error("WARNING: File system has desynchronized. Received following error: " + err + "\n$");
                }
                if (_this._queue.length > 0) {
                    var op = _this._queue.shift(), args = op.arguments;
                    args.push(doNextOp);
                    _this._async[op.apiMethod].apply(_this._async, args);
                }
                else {
                    _this._queueRunning = false;
                }
            };
            doNextOp();
        }
    };
    AsyncMirrorFS.prototype.renameSync = function (oldPath, newPath) {
        this._sync.renameSync(oldPath, newPath);
        this.enqueueOp({
            apiMethod: 'rename',
            arguments: [oldPath, newPath]
        });
    };
    AsyncMirrorFS.prototype.statSync = function (p, isLstat) {
        return this._sync.statSync(p, isLstat);
    };
    AsyncMirrorFS.prototype.openSync = function (p, flag, mode) {
        var fd = this._sync.openSync(p, flag, mode);
        fd.closeSync();
        return new MirrorFile(this, p, flag, this._sync.statSync(p, false), this._sync.readFileSync(p, null, file_flag.FileFlag.getFileFlag('r')));
    };
    AsyncMirrorFS.prototype.unlinkSync = function (p) {
        this._sync.unlinkSync(p);
        this.enqueueOp({
            apiMethod: 'unlink',
            arguments: [p]
        });
    };
    AsyncMirrorFS.prototype.rmdirSync = function (p) {
        this._sync.rmdirSync(p);
        this.enqueueOp({
            apiMethod: 'rmdir',
            arguments: [p]
        });
    };
    AsyncMirrorFS.prototype.mkdirSync = function (p, mode) {
        this._sync.mkdirSync(p, mode);
        this.enqueueOp({
            apiMethod: 'mkdir',
            arguments: [p, mode]
        });
    };
    AsyncMirrorFS.prototype.readdirSync = function (p) {
        return this._sync.readdirSync(p);
    };
    AsyncMirrorFS.prototype.existsSync = function (p) {
        return this._sync.existsSync(p);
    };
    AsyncMirrorFS.prototype.chmodSync = function (p, isLchmod, mode) {
        this._sync.chmodSync(p, isLchmod, mode);
        this.enqueueOp({
            apiMethod: 'chmod',
            arguments: [p, isLchmod, mode]
        });
    };
    AsyncMirrorFS.prototype.chownSync = function (p, isLchown, uid, gid) {
        this._sync.chownSync(p, isLchown, uid, gid);
        this.enqueueOp({
            apiMethod: 'chown',
            arguments: [p, isLchown, uid, gid]
        });
    };
    AsyncMirrorFS.prototype.utimesSync = function (p, atime, mtime) {
        this._sync.utimesSync(p, atime, mtime);
        this.enqueueOp({
            apiMethod: 'utimes',
            arguments: [p, atime, mtime]
        });
    };
    return AsyncMirrorFS;
})(file_system.SynchronousFileSystem);
browserfs.registerFileSystem('AsyncMirrorFS', AsyncMirrorFS);
module.exports = AsyncMirrorFS;

},{"../core/browserfs":12,"../core/file_flag":19,"../core/file_system":20,"../core/node_path":24,"../generic/preload_file":31}],9:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var kvfs = require('../generic/key_value_filesystem');
var browserfs = require('../core/browserfs');
var InMemoryStore = (function () {
    function InMemoryStore() {
        this.store = {};
    }
    InMemoryStore.prototype.name = function () { return 'In-memory'; };
    InMemoryStore.prototype.clear = function () { this.store = {}; };
    InMemoryStore.prototype.beginTransaction = function (type) {
        return new kvfs.SimpleSyncRWTransaction(this);
    };
    InMemoryStore.prototype.get = function (key) {
        return this.store[key];
    };
    InMemoryStore.prototype.put = function (key, data, overwrite) {
        if (!overwrite && this.store.hasOwnProperty(key)) {
            return false;
        }
        this.store[key] = data;
        return true;
    };
    InMemoryStore.prototype.delete = function (key) {
        delete this.store[key];
    };
    return InMemoryStore;
})();
exports.InMemoryStore = InMemoryStore;
var InMemoryFileSystem = (function (_super) {
    __extends(InMemoryFileSystem, _super);
    function InMemoryFileSystem() {
        _super.call(this, { store: new InMemoryStore() });
    }
    return InMemoryFileSystem;
})(kvfs.SyncKeyValueFileSystem);
exports.InMemoryFileSystem = InMemoryFileSystem;
browserfs.registerFileSystem('InMemory', InMemoryFileSystem);

},{"../core/browserfs":12,"../generic/key_value_filesystem":30}],10:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var file_system = require('../core/file_system');
var buffer = require('../core/buffer');
var api_error = require('../core/api_error');
var file_flag = require('../core/file_flag');
var preload_file = require('../generic/preload_file');
var browserfs = require('../core/browserfs');
var path = require('../core/node_path');
var ApiError = api_error.ApiError;
var Buffer = buffer.Buffer;
var ErrorCode = api_error.ErrorCode;
var deletionLogPath = '/.deletedFiles.log';
function makeModeWritable(mode) {
    return 0x92 | mode;
}
var OverlayFile = (function (_super) {
    __extends(OverlayFile, _super);
    function OverlayFile(fs, path, flag, stats, data) {
        _super.call(this, fs, path, flag, stats, data);
    }
    OverlayFile.prototype.syncSync = function () {
        if (this.isDirty()) {
            this._fs._syncSync(this);
            this.resetDirty();
        }
    };
    OverlayFile.prototype.closeSync = function () {
        this.syncSync();
    };
    return OverlayFile;
})(preload_file.PreloadFile);
var OverlayFS = (function (_super) {
    __extends(OverlayFS, _super);
    function OverlayFS(writable, readable) {
        _super.call(this);
        this._isInitialized = false;
        this._deletedFiles = {};
        this._deleteLog = null;
        this._writable = writable;
        this._readable = readable;
        if (this._writable.isReadOnly()) {
            throw new ApiError(ErrorCode.EINVAL, "Writable file system must be writable.");
        }
        if (!this._writable.supportsSynch() || !this._readable.supportsSynch()) {
            throw new ApiError(ErrorCode.EINVAL, "OverlayFS currently only operates on synchronous file systems.");
        }
    }
    OverlayFS.prototype.getOverlayedFileSystems = function () {
        return {
            readable: this._readable,
            writable: this._writable
        };
    };
    OverlayFS.prototype.createParentDirectories = function (p) {
        var _this = this;
        var parent = path.dirname(p), toCreate = [];
        while (!this._writable.existsSync(parent)) {
            toCreate.push(parent);
            parent = path.dirname(parent);
        }
        toCreate = toCreate.reverse();
        toCreate.forEach(function (p) {
            _this._writable.mkdirSync(p, _this.statSync(p, false).mode);
        });
    };
    OverlayFS.isAvailable = function () {
        return true;
    };
    OverlayFS.prototype._syncSync = function (file) {
        this.createParentDirectories(file.getPath());
        this._writable.writeFileSync(file.getPath(), file.getBuffer(), null, file_flag.FileFlag.getFileFlag('w'), file.getStats().mode);
    };
    OverlayFS.prototype.getName = function () {
        return "OverlayFS";
    };
    OverlayFS.prototype.initialize = function (cb) {
        var _this = this;
        if (!this._isInitialized) {
            this._writable.readFile(deletionLogPath, 'utf8', file_flag.FileFlag.getFileFlag('r'), function (err, data) {
                if (err) {
                    if (err.type !== ErrorCode.ENOENT) {
                        return cb(err);
                    }
                }
                else {
                    data.split('\n').forEach(function (path) {
                        _this._deletedFiles[path.slice(1)] = path.slice(0, 1) === 'd';
                    });
                }
                _this._writable.open(deletionLogPath, file_flag.FileFlag.getFileFlag('a'), 0x1a4, function (err, fd) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        _this._deleteLog = fd;
                        cb();
                    }
                });
            });
        }
        else {
            cb();
        }
    };
    OverlayFS.prototype.isReadOnly = function () { return false; };
    OverlayFS.prototype.supportsSynch = function () { return true; };
    OverlayFS.prototype.supportsLinks = function () { return false; };
    OverlayFS.prototype.supportsProps = function () { return this._readable.supportsProps() && this._writable.supportsProps(); };
    OverlayFS.prototype.deletePath = function (p) {
        this._deletedFiles[p] = true;
        var buff = new Buffer("d" + p + "\n");
        this._deleteLog.writeSync(buff, 0, buff.length, null);
        this._deleteLog.syncSync();
    };
    OverlayFS.prototype.undeletePath = function (p) {
        if (this._deletedFiles[p]) {
            this._deletedFiles[p] = false;
            var buff = new Buffer("u" + p);
            this._deleteLog.writeSync(buff, 0, buff.length, null);
            this._deleteLog.syncSync();
        }
    };
    OverlayFS.prototype.renameSync = function (oldPath, newPath) {
        var _this = this;
        var oldStats = this.statSync(oldPath, false);
        if (oldStats.isDirectory()) {
            if (oldPath === newPath) {
                return;
            }
            var mode = 0x1ff;
            if (this.existsSync(newPath)) {
                var stats = this.statSync(newPath, false), mode = stats.mode;
                if (stats.isDirectory()) {
                    if (this.readdirSync(newPath).length > 0) {
                        throw new ApiError(ErrorCode.ENOTEMPTY, "Path " + newPath + " not empty.");
                    }
                }
                else {
                    throw new ApiError(ErrorCode.ENOTDIR, "Path " + newPath + " is a file.");
                }
            }
            if (this._writable.existsSync(oldPath)) {
                this._writable.renameSync(oldPath, newPath);
            }
            else if (!this._writable.existsSync(newPath)) {
                this._writable.mkdirSync(newPath, mode);
            }
            if (this._readable.existsSync(oldPath)) {
                this._readable.readdirSync(oldPath).forEach(function (name) {
                    _this.renameSync(path.resolve(oldPath, name), path.resolve(newPath, name));
                });
            }
        }
        else {
            if (this.existsSync(newPath) && this.statSync(newPath, false).isDirectory()) {
                throw new ApiError(ErrorCode.EISDIR, "Path " + newPath + " is a directory.");
            }
            this.writeFileSync(newPath, this.readFileSync(oldPath, null, file_flag.FileFlag.getFileFlag('r')), null, file_flag.FileFlag.getFileFlag('w'), oldStats.mode);
        }
        if (oldPath !== newPath && this.existsSync(oldPath)) {
            this.unlinkSync(oldPath);
        }
    };
    OverlayFS.prototype.statSync = function (p, isLstat) {
        try {
            return this._writable.statSync(p, isLstat);
        }
        catch (e) {
            if (this._deletedFiles[p]) {
                throw new ApiError(ErrorCode.ENOENT, "Path " + p + " does not exist.");
            }
            var oldStat = this._readable.statSync(p, isLstat).clone();
            oldStat.mode = makeModeWritable(oldStat.mode);
            return oldStat;
        }
    };
    OverlayFS.prototype.openSync = function (p, flag, mode) {
        if (this.existsSync(p)) {
            switch (flag.pathExistsAction()) {
                case file_flag.ActionType.TRUNCATE_FILE:
                    this.createParentDirectories(p);
                    return this._writable.openSync(p, flag, mode);
                case file_flag.ActionType.NOP:
                    if (this._writable.existsSync(p)) {
                        return this._writable.openSync(p, flag, mode);
                    }
                    else {
                        var stats = this._readable.statSync(p, false).clone();
                        stats.mode = mode;
                        return new OverlayFile(this, p, flag, stats, this._readable.readFileSync(p, null, file_flag.FileFlag.getFileFlag('r')));
                    }
                default:
                    throw new ApiError(ErrorCode.EEXIST, "Path " + p + " exists.");
            }
        }
        else {
            switch (flag.pathNotExistsAction()) {
                case file_flag.ActionType.CREATE_FILE:
                    this.createParentDirectories(p);
                    return this._writable.openSync(p, flag, mode);
                default:
                    throw new ApiError(ErrorCode.ENOENT, "Path " + p + " does not exist.");
            }
        }
    };
    OverlayFS.prototype.unlinkSync = function (p) {
        if (this.existsSync(p)) {
            if (this._writable.existsSync(p)) {
                this._writable.unlinkSync(p);
            }
            if (this.existsSync(p)) {
                this.deletePath(p);
            }
        }
        else {
            throw new ApiError(ErrorCode.ENOENT, "Path " + p + " does not exist.");
        }
    };
    OverlayFS.prototype.rmdirSync = function (p) {
        if (this.existsSync(p)) {
            if (this._writable.existsSync(p)) {
                this._writable.rmdirSync(p);
            }
            if (this.existsSync(p)) {
                if (this.readdirSync(p).length > 0) {
                    throw new ApiError(ErrorCode.ENOTEMPTY, "Directory " + p + " is not empty.");
                }
                else {
                    this.deletePath(p);
                }
            }
        }
        else {
            throw new ApiError(ErrorCode.ENOENT, "Path " + p + " does not exist.");
        }
    };
    OverlayFS.prototype.mkdirSync = function (p, mode) {
        if (this.existsSync(p)) {
            throw new ApiError(ErrorCode.EEXIST, "Path " + p + " already exists.");
        }
        else {
            this.createParentDirectories(p);
            this._writable.mkdirSync(p, mode);
        }
    };
    OverlayFS.prototype.readdirSync = function (p) {
        var _this = this;
        var dirStats = this.statSync(p, false);
        if (!dirStats.isDirectory()) {
            throw new ApiError(ErrorCode.ENOTDIR, "Path " + p + " is not a directory.");
        }
        var contents = [];
        try {
            contents = contents.concat(this._writable.readdirSync(p));
        }
        catch (e) {
        }
        try {
            contents = contents.concat(this._readable.readdirSync(p));
        }
        catch (e) {
        }
        var seenMap = {};
        return contents.filter(function (fileP) {
            var result = seenMap[fileP] === undefined && _this._deletedFiles[p + "/" + fileP] !== true;
            seenMap[fileP] = true;
            return result;
        });
    };
    OverlayFS.prototype.existsSync = function (p) {
        return this._writable.existsSync(p) || (this._readable.existsSync(p) && this._deletedFiles[p] !== true);
    };
    OverlayFS.prototype.chmodSync = function (p, isLchmod, mode) {
        var _this = this;
        this.operateOnWritable(p, function () {
            _this._writable.chmodSync(p, isLchmod, mode);
        });
    };
    OverlayFS.prototype.chownSync = function (p, isLchown, uid, gid) {
        var _this = this;
        this.operateOnWritable(p, function () {
            _this._writable.chownSync(p, isLchown, uid, gid);
        });
    };
    OverlayFS.prototype.utimesSync = function (p, atime, mtime) {
        var _this = this;
        this.operateOnWritable(p, function () {
            _this._writable.utimesSync(p, atime, mtime);
        });
    };
    OverlayFS.prototype.operateOnWritable = function (p, f) {
        if (this.existsSync(p)) {
            if (!this._writable.existsSync(p)) {
                this.copyToWritable(p);
            }
            f();
        }
        else {
            throw new ApiError(ErrorCode.ENOENT, "Path " + p + " does not exist.");
        }
    };
    OverlayFS.prototype.copyToWritable = function (p) {
        var pStats = this.statSync(p, false);
        if (pStats.isDirectory()) {
            this._writable.mkdirSync(p, pStats.mode);
        }
        else {
            this.writeFileSync(p, this._readable.readFileSync(p, null, file_flag.FileFlag.getFileFlag('r')), null, file_flag.FileFlag.getFileFlag('w'), this.statSync(p, false).mode);
        }
    };
    return OverlayFS;
})(file_system.SynchronousFileSystem);
browserfs.registerFileSystem('OverlayFS', OverlayFS);
module.exports = OverlayFS;

},{"../core/api_error":11,"../core/browserfs":12,"../core/buffer":13,"../core/file_flag":19,"../core/file_system":20,"../core/node_path":24,"../generic/preload_file":31}],11:[function(require,module,exports){
var buffer = require("./buffer");
var Buffer = buffer.Buffer;
(function (ErrorCode) {
    ErrorCode[ErrorCode["EPERM"] = 0] = "EPERM";
    ErrorCode[ErrorCode["ENOENT"] = 1] = "ENOENT";
    ErrorCode[ErrorCode["EIO"] = 2] = "EIO";
    ErrorCode[ErrorCode["EBADF"] = 3] = "EBADF";
    ErrorCode[ErrorCode["EACCES"] = 4] = "EACCES";
    ErrorCode[ErrorCode["EBUSY"] = 5] = "EBUSY";
    ErrorCode[ErrorCode["EEXIST"] = 6] = "EEXIST";
    ErrorCode[ErrorCode["ENOTDIR"] = 7] = "ENOTDIR";
    ErrorCode[ErrorCode["EISDIR"] = 8] = "EISDIR";
    ErrorCode[ErrorCode["EINVAL"] = 9] = "EINVAL";
    ErrorCode[ErrorCode["EFBIG"] = 10] = "EFBIG";
    ErrorCode[ErrorCode["ENOSPC"] = 11] = "ENOSPC";
    ErrorCode[ErrorCode["EROFS"] = 12] = "EROFS";
    ErrorCode[ErrorCode["ENOTEMPTY"] = 13] = "ENOTEMPTY";
    ErrorCode[ErrorCode["ENOTSUP"] = 14] = "ENOTSUP";
})(exports.ErrorCode || (exports.ErrorCode = {}));
var ErrorCode = exports.ErrorCode;
var ErrorStrings = {};
ErrorStrings[ErrorCode.EPERM] = 'Operation not permitted.';
ErrorStrings[ErrorCode.ENOENT] = 'No such file or directory.';
ErrorStrings[ErrorCode.EIO] = 'Input/output error.';
ErrorStrings[ErrorCode.EBADF] = 'Bad file descriptor.';
ErrorStrings[ErrorCode.EACCES] = 'Permission denied.';
ErrorStrings[ErrorCode.EBUSY] = 'Resource busy or locked.';
ErrorStrings[ErrorCode.EEXIST] = 'File exists.';
ErrorStrings[ErrorCode.ENOTDIR] = 'File is not a directory.';
ErrorStrings[ErrorCode.EISDIR] = 'File is a directory.';
ErrorStrings[ErrorCode.EINVAL] = 'Invalid argument.';
ErrorStrings[ErrorCode.EFBIG] = 'File is too big.';
ErrorStrings[ErrorCode.ENOSPC] = 'No space left on disk.';
ErrorStrings[ErrorCode.EROFS] = 'Cannot modify a read-only file system.';
ErrorStrings[ErrorCode.ENOTEMPTY] = 'Directory is not empty.';
ErrorStrings[ErrorCode.ENOTSUP] = 'Operation is not supported.';
var ApiError = (function () {
    function ApiError(type, message) {
        this.type = type;
        this.code = ErrorCode[type];
        if (message != null) {
            this.message = message;
        }
        else {
            this.message = ErrorStrings[type];
        }
    }
    ApiError.prototype.toString = function () {
        return this.code + ": " + ErrorStrings[this.type] + " " + this.message;
    };
    ApiError.prototype.writeToBuffer = function (buffer, i) {
        if (buffer === void 0) { buffer = new Buffer(this.bufferSize()); }
        if (i === void 0) { i = 0; }
        buffer.writeUInt8(this.type, i);
        var bytesWritten = buffer.write(this.message, i + 5);
        buffer.writeUInt32LE(bytesWritten, i + 1);
        return buffer;
    };
    ApiError.fromBuffer = function (buffer, i) {
        if (i === void 0) { i = 0; }
        return new ApiError(buffer.readUInt8(i), buffer.toString("utf8", i + 5, i + 5 + buffer.readUInt32LE(i + 1)));
    };
    ApiError.prototype.bufferSize = function () {
        return 5 + Buffer.byteLength(this.message);
    };
    ApiError.FileError = function (code, p) {
        return new ApiError(code, p + ": " + ErrorStrings[code]);
    };
    ApiError.ENOENT = function (path) {
        return this.FileError(ErrorCode.ENOENT, path);
    };
    ApiError.EEXIST = function (path) {
        return this.FileError(ErrorCode.EEXIST, path);
    };
    ApiError.EISDIR = function (path) {
        return this.FileError(ErrorCode.EISDIR, path);
    };
    ApiError.ENOTDIR = function (path) {
        return this.FileError(ErrorCode.ENOTDIR, path);
    };
    ApiError.EPERM = function (path) {
        return this.FileError(ErrorCode.EPERM, path);
    };
    return ApiError;
})();
exports.ApiError = ApiError;

},{"./buffer":13}],12:[function(require,module,exports){
var buffer = require('./buffer');
var path = require('./node_path');
var node_process = require('./node_process');
var node_fs_1 = require('./node_fs');
function install(obj) {
    obj.Buffer = buffer.Buffer;
    obj.process = node_process.process;
    var oldRequire = obj.require != null ? obj.require : null;
    obj.require = function (arg) {
        var rv = BFSRequire(arg);
        if (rv == null) {
            return oldRequire.apply(null, Array.prototype.slice.call(arguments, 0));
        }
        else {
            return rv;
        }
    };
}
exports.install = install;
exports.FileSystem = {};
function registerFileSystem(name, fs) {
    exports.FileSystem[name] = fs;
}
exports.registerFileSystem = registerFileSystem;
function BFSRequire(module) {
    switch (module) {
        case 'fs':
            return node_fs_1.fs;
        case 'path':
            return path;
        case 'buffer':
            return buffer;
        case 'process':
            return node_process.process;
        default:
            return exports.FileSystem[module];
    }
}
exports.BFSRequire = BFSRequire;
function initialize(rootfs) {
    return node_fs_1.fs._initialize(rootfs);
}
exports.initialize = initialize;

},{"./buffer":13,"./node_fs":22,"./node_path":24,"./node_process":25}],13:[function(require,module,exports){
var buffer_core = require('./buffer_core');
var buffer_core_array = require('./buffer_core_array');
var buffer_core_arraybuffer = require('./buffer_core_arraybuffer');
var buffer_core_imagedata = require('./buffer_core_imagedata');
var string_util = require('./string_util');
var BufferCorePreferences = [
    buffer_core_arraybuffer.BufferCoreArrayBuffer,
    buffer_core_imagedata.BufferCoreImageData,
    buffer_core_array.BufferCoreArray
];
var PreferredBufferCore = (function () {
    var i, bci;
    for (i = 0; i < BufferCorePreferences.length; i++) {
        bci = BufferCorePreferences[i];
        if (bci.isAvailable())
            return bci;
    }
    throw new Error("This browser does not support any available BufferCore implementations.");
})();
var Buffer = (function () {
    function Buffer(arg1, arg2, arg3) {
        if (arg2 === void 0) { arg2 = 'utf8'; }
        this.offset = 0;
        var i;
        if (!(this instanceof Buffer)) {
            return new Buffer(arg1, arg2);
        }
        if (arg1 instanceof buffer_core.BufferCoreCommon) {
            this.data = arg1;
            var start = typeof arg2 === 'number' ? arg2 : 0;
            var end = typeof arg3 === 'number' ? arg3 : this.data.getLength();
            this.offset = start;
            this.length = end - start;
        }
        else if (typeof arg1 === 'number') {
            if (arg1 !== (arg1 >>> 0)) {
                throw new TypeError('Buffer size must be a uint32.');
            }
            this.length = arg1;
            this.data = new PreferredBufferCore(arg1);
        }
        else if (typeof DataView !== 'undefined' && arg1 instanceof DataView) {
            this.data = new buffer_core_arraybuffer.BufferCoreArrayBuffer(arg1);
            this.length = arg1.byteLength;
        }
        else if (typeof ArrayBuffer !== 'undefined' && typeof arg1.byteLength === 'number') {
            this.data = new buffer_core_arraybuffer.BufferCoreArrayBuffer(arg1);
            this.length = arg1.byteLength;
        }
        else if (arg1 instanceof Buffer) {
            var argBuff = arg1;
            this.data = new PreferredBufferCore(arg1.length);
            this.length = arg1.length;
            argBuff.copy(this);
        }
        else if (Array.isArray(arg1) || (arg1 != null && typeof arg1 === 'object' && typeof arg1[0] === 'number')) {
            this.data = new PreferredBufferCore(arg1.length);
            for (i = 0; i < arg1.length; i++) {
                this.data.writeUInt8(i, arg1[i]);
            }
            this.length = arg1.length;
        }
        else if (typeof arg1 === 'string') {
            this.length = Buffer.byteLength(arg1, arg2);
            this.data = new PreferredBufferCore(this.length);
            this.write(arg1, 0, this.length, arg2);
        }
        else {
            throw new Error("Invalid argument to Buffer constructor: " + arg1);
        }
    }
    Buffer.getAvailableBufferCores = function () {
        return BufferCorePreferences.filter(function (bci) { return bci.isAvailable(); });
    };
    Buffer.getPreferredBufferCore = function () {
        return PreferredBufferCore;
    };
    Buffer.setPreferredBufferCore = function (bci) {
        PreferredBufferCore = bci;
    };
    Buffer.prototype.getBufferCore = function () {
        return this.data;
    };
    Buffer.prototype.getOffset = function () {
        return this.offset;
    };
    Buffer.prototype.set = function (index, value) {
        if (value < 0) {
            return this.writeInt8(value, index);
        }
        else {
            return this.writeUInt8(value, index);
        }
    };
    Buffer.prototype.get = function (index) {
        return this.readUInt8(index);
    };
    Buffer.prototype.write = function (str, offset, length, encoding) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = this.length; }
        if (encoding === void 0) { encoding = 'utf8'; }
        if (typeof offset === 'string') {
            encoding = "" + offset;
            offset = 0;
            length = this.length;
        }
        else if (typeof length === 'string') {
            encoding = "" + length;
            length = this.length;
        }
        if (offset > this.length || offset < 0) {
            throw new RangeError("Invalid offset.");
        }
        var strUtil = string_util.FindUtil(encoding);
        length = length + offset > this.length ? this.length - offset : length;
        offset += this.offset;
        return strUtil.str2byte(str, offset === 0 && length === this.length ? this : new Buffer(this.data, offset, length + offset));
    };
    Buffer.prototype.toString = function (encoding, start, end) {
        if (encoding === void 0) { encoding = 'utf8'; }
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.length; }
        if (!(start <= end)) {
            throw new Error("Invalid start/end positions: " + start + " - " + end);
        }
        if (start === end) {
            return '';
        }
        if (end > this.length) {
            end = this.length;
        }
        var strUtil = string_util.FindUtil(encoding);
        return strUtil.byte2str(start === 0 && end === this.length ? this : new Buffer(this.data, start + this.offset, end + this.offset));
    };
    Buffer.prototype.toJSON = function () {
        var len = this.length;
        var byteArr = new Array(len);
        for (var i = 0; i < len; i++) {
            byteArr[i] = this.readUInt8(i);
        }
        return {
            type: 'Buffer',
            data: byteArr
        };
    };
    Buffer.prototype.inspect = function () {
        var digits = [], i, len = this.length < 50 ? this.length : 50;
        for (i = 0; i < len; i++) {
            digits.push(this.readUInt8(i).toString(16));
        }
        return "<Buffer " + digits.join(" ") + (this.length > 50 ? " ... " : "") + ">";
    };
    Buffer.prototype.toArrayBuffer = function () {
        var buffCore = this.getBufferCore();
        if (buffCore instanceof buffer_core_arraybuffer.BufferCoreArrayBuffer) {
            var dv = buffCore.getDataView(), ab = dv.buffer;
            if (dv.byteOffset === 0 && dv.byteLength === ab.byteLength) {
                return ab;
            }
            else {
                return ab.slice(dv.byteOffset, dv.byteLength);
            }
        }
        else {
            var ab = new ArrayBuffer(this.length), newBuff = new Buffer(ab);
            this.copy(newBuff, 0, 0, this.length);
            return ab;
        }
    };
    Buffer.prototype.indexOf = function (value, byteOffset) {
        if (byteOffset === void 0) { byteOffset = 0; }
        var normalizedValue;
        if (typeof (value) === 'string') {
            normalizedValue = new Buffer(value, 'utf8');
        }
        else if (Buffer.isBuffer(value)) {
            normalizedValue = value;
        }
        else {
            normalizedValue = new Buffer(value);
        }
        var valOffset = 0, currentVal, valLen = normalizedValue.length, bufLen = this.length;
        while (valOffset < valLen && byteOffset < bufLen) {
            if (normalizedValue.readUInt8(valOffset) == this.readUInt8(byteOffset)) {
                valOffset++;
            }
            else {
                valOffset = 0;
            }
            byteOffset++;
        }
        if (valOffset == valLen) {
            return byteOffset - valLen;
        }
        else {
            return -1;
        }
    };
    Buffer.prototype.copy = function (target, targetStart, sourceStart, sourceEnd) {
        if (targetStart === void 0) { targetStart = 0; }
        if (sourceStart === void 0) { sourceStart = 0; }
        if (sourceEnd === void 0) { sourceEnd = this.length; }
        if (sourceStart < 0) {
            throw new RangeError('sourceStart out of bounds');
        }
        if (sourceEnd < 0) {
            throw new RangeError('sourceEnd out of bounds');
        }
        if (targetStart < 0) {
            throw new RangeError("targetStart out of bounds");
        }
        if (sourceEnd <= sourceStart || sourceStart >= this.length || targetStart > target.length) {
            return 0;
        }
        var bytesCopied = Math.min(sourceEnd - sourceStart, target.length - targetStart, this.length - sourceStart), i;
        for (i = 0; i < bytesCopied - 3; i += 4) {
            target.writeInt32LE(this.readInt32LE(sourceStart + i), targetStart + i);
        }
        for (i = bytesCopied & 0xFFFFFFFC; i < bytesCopied; i++) {
            target.writeUInt8(this.readUInt8(sourceStart + i), targetStart + i);
        }
        return bytesCopied;
    };
    Buffer.prototype.slice = function (start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.length; }
        if (start < 0) {
            start += this.length;
            if (start < 0) {
                start = 0;
            }
        }
        if (end < 0) {
            end += this.length;
            if (end < 0) {
                end = 0;
            }
        }
        if (end > this.length) {
            end = this.length;
        }
        if (start > end) {
            start = end;
        }
        if (start < 0 || end < 0 || start >= this.length || end > this.length) {
            throw new Error("Invalid slice indices.");
        }
        return new Buffer(this.data, start + this.offset, end + this.offset);
    };
    Buffer.prototype.sliceCopy = function (start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.length; }
        if (start < 0) {
            start += this.length;
            if (start < 0) {
                start = 0;
            }
        }
        if (end < 0) {
            end += this.length;
            if (end < 0) {
                end = 0;
            }
        }
        if (end > this.length) {
            end = this.length;
        }
        if (start > end) {
            start = end;
        }
        if (start < 0 || end < 0 || start >= this.length || end > this.length) {
            throw new Error("Invalid slice indices.");
        }
        return new Buffer(this.data.copy(start + this.offset, end + this.offset));
    };
    Buffer.prototype.fill = function (value, offset, end) {
        if (offset === void 0) { offset = 0; }
        if (end === void 0) { end = this.length; }
        var i;
        offset = offset >> 0;
        end = end >>> 0;
        if (offset < 0 || end > this.length) {
            throw new RangeError('out of range index');
        }
        else if (end <= offset) {
            return;
        }
        if (typeof value !== 'string') {
            value = value >>> 0;
        }
        else if (value.length === 1) {
            var code = value.charCodeAt(0);
            if (code < 256) {
                value = code;
            }
        }
        if (typeof value === 'number') {
            offset += this.offset;
            end += this.offset;
            this.data.fill(value, offset, end);
        }
        else if (value.length > 0) {
            var byteLen = Buffer.byteLength(value, 'utf8'), lastBulkWrite = end - byteLen;
            while (offset < lastBulkWrite) {
                this.write(value, offset, byteLen, 'utf8');
                offset += byteLen;
            }
            if (offset < end) {
                this.write(value, offset, end - offset, 'utf8');
            }
        }
    };
    Buffer.prototype.readUIntLE = function (offset, byteLength, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        var value = 0;
        switch (byteLength) {
            case 1:
                return this.data.readUInt8(offset);
            case 2:
                return this.data.readUInt16LE(offset);
            case 3:
                return this.data.readUInt8(offset) | (this.data.readUInt16LE(offset + 1) << 8);
            case 4:
                return this.data.readUInt32LE(offset);
            case 6:
                value += (this.data.readUInt8(offset + 5) << 23) * 0x20000;
            case 5:
                value += (this.data.readUInt8(offset + 5) << 23) * 0x200;
                return value + this.data.readUInt32LE(offset);
            default:
                throw new Error("Invalid byteLength: " + byteLength);
        }
    };
    Buffer.prototype.readUIntBE = function (offset, byteLength, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        var value = 0;
        switch (byteLength) {
            case 1:
                return this.data.readUInt8(offset);
            case 2:
                return this.data.readUInt16BE(offset);
            case 3:
                return this.data.readUInt8(offset + 2) | (this.data.readUInt16BE(offset) << 8);
            case 4:
                return this.data.readUInt32BE(offset);
            case 6:
                value += (this.data.readUInt8(offset) << 23) * 0x20000;
                offset++;
            case 5:
                value += (this.data.readUInt8(offset) << 23) * 0x200;
                return value + this.data.readUInt32BE(offset + 1);
            default:
                throw new Error("Invalid byteLength: " + byteLength);
        }
    };
    Buffer.prototype.readIntLE = function (offset, byteLength, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        switch (byteLength) {
            case 1:
                return this.data.readInt8(offset);
            case 2:
                return this.data.readInt16LE(offset);
            case 3:
                return this.data.readUInt8(offset) | (this.data.readInt16LE(offset + 1) << 8);
            case 4:
                return this.data.readInt32LE(offset);
            case 6:
                return ((this.data.readInt8(offset + 5) << 23) * 0x20000) + this.readUIntLE(offset - this.offset, 5, noAssert);
            case 5:
                return ((this.data.readInt8(offset + 5) << 23) * 0x200) + this.data.readUInt32LE(offset);
            default:
                throw new Error("Invalid byteLength: " + byteLength);
        }
    };
    Buffer.prototype.readIntBE = function (offset, byteLength, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        switch (byteLength) {
            case 1:
                return this.data.readInt8(offset);
            case 2:
                return this.data.readInt16BE(offset);
            case 3:
                return this.data.readUInt8(offset + 2) | (this.data.readInt16BE(offset) << 8);
            case 4:
                return this.data.readInt32BE(offset);
            case 6:
                return ((this.data.readInt8(offset) << 23) * 0x20000) + this.readUIntBE(offset - this.offset + 1, 5, noAssert);
            case 5:
                return ((this.data.readInt8(offset) << 23) * 0x200) + this.data.readUInt32BE(offset + 1);
            default:
                throw new Error("Invalid byteLength: " + byteLength);
        }
    };
    Buffer.prototype.readUInt8 = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readUInt8(offset);
    };
    Buffer.prototype.readUInt16LE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readUInt16LE(offset);
    };
    Buffer.prototype.readUInt16BE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readUInt16BE(offset);
    };
    Buffer.prototype.readUInt32LE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readUInt32LE(offset);
    };
    Buffer.prototype.readUInt32BE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readUInt32BE(offset);
    };
    Buffer.prototype.readInt8 = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readInt8(offset);
    };
    Buffer.prototype.readInt16LE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readInt16LE(offset);
    };
    Buffer.prototype.readInt16BE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readInt16BE(offset);
    };
    Buffer.prototype.readInt32LE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readInt32LE(offset);
    };
    Buffer.prototype.readInt32BE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readInt32BE(offset);
    };
    Buffer.prototype.readFloatLE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readFloatLE(offset);
    };
    Buffer.prototype.readFloatBE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readFloatBE(offset);
    };
    Buffer.prototype.readDoubleLE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readDoubleLE(offset);
    };
    Buffer.prototype.readDoubleBE = function (offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        return this.data.readDoubleBE(offset);
    };
    Buffer.prototype.writeUIntLE = function (value, offset, byteLength, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        var rv = offset + byteLength;
        offset += this.offset;
        switch (byteLength) {
            case 1:
                this.data.writeUInt8(value, offset);
                break;
            case 2:
                this.data.writeUInt16LE(value, offset);
                break;
            case 3:
                this.data.writeUInt8(value & 0xFF, offset);
                this.data.writeUInt16LE(value >> 8, offset + 1);
                break;
            case 4:
                this.data.writeUInt32LE(value, offset);
                break;
            case 6:
                this.data.writeUInt8(value & 0xFF, offset);
                value = Math.floor(value / 256);
                offset++;
            case 5:
                this.data.writeUInt8(value & 0xFF, offset);
                value = Math.floor(value / 256);
                this.data.writeUInt32LE(value, offset + 1);
                break;
            default:
                throw new Error("Invalid byteLength: " + byteLength);
        }
        return rv;
    };
    Buffer.prototype.writeUIntBE = function (value, offset, byteLength, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        var rv = offset + byteLength;
        offset += this.offset;
        switch (byteLength) {
            case 1:
                this.data.writeUInt8(value, offset);
                break;
            case 2:
                this.data.writeUInt16BE(value, offset);
                break;
            case 3:
                this.data.writeUInt8(value & 0xFF, offset + 2);
                this.data.writeUInt16BE(value >> 8, offset);
                break;
            case 4:
                this.data.writeUInt32BE(value, offset);
                break;
            case 6:
                this.data.writeUInt8(value & 0xFF, offset + 5);
                value = Math.floor(value / 256);
            case 5:
                this.data.writeUInt8(value & 0xFF, offset + 4);
                value = Math.floor(value / 256);
                this.data.writeUInt32BE(value, offset);
                break;
            default:
                throw new Error("Invalid byteLength: " + byteLength);
        }
        return rv;
    };
    Buffer.prototype.writeIntLE = function (value, offset, byteLength, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        var rv = offset + byteLength;
        offset += this.offset;
        switch (byteLength) {
            case 1:
                this.data.writeInt8(value, offset);
                break;
            case 2:
                this.data.writeInt16LE(value, offset);
                break;
            case 3:
                this.data.writeUInt8(value & 0xFF, offset);
                this.data.writeInt16LE(value >> 8, offset + 1);
                break;
            case 4:
                this.data.writeInt32LE(value, offset);
                break;
            case 6:
                this.data.writeUInt8(value & 0xFF, offset);
                value = Math.floor(value / 256);
                offset++;
            case 5:
                this.data.writeUInt8(value & 0xFF, offset);
                value = Math.floor(value / 256);
                this.data.writeInt32LE(value, offset + 1);
                break;
            default:
                throw new Error("Invalid byteLength: " + byteLength);
        }
        return rv;
    };
    Buffer.prototype.writeIntBE = function (value, offset, byteLength, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        var rv = offset + byteLength;
        offset += this.offset;
        switch (byteLength) {
            case 1:
                this.data.writeInt8(value, offset);
                break;
            case 2:
                this.data.writeInt16BE(value, offset);
                break;
            case 3:
                this.data.writeUInt8(value & 0xFF, offset + 2);
                this.data.writeInt16BE(value >> 8, offset);
                break;
            case 4:
                this.data.writeInt32BE(value, offset);
                break;
            case 6:
                this.data.writeUInt8(value & 0xFF, offset + 5);
                value = Math.floor(value / 256);
            case 5:
                this.data.writeUInt8(value & 0xFF, offset + 4);
                value = Math.floor(value / 256);
                this.data.writeInt32BE(value, offset);
                break;
            default:
                throw new Error("Invalid byteLength: " + byteLength);
        }
        return rv;
    };
    Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeUInt8(offset, value);
    };
    Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeUInt16LE(offset, value);
    };
    Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeUInt16BE(offset, value);
    };
    Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeUInt32LE(offset, value);
    };
    Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeUInt32BE(offset, value);
    };
    Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeInt8(offset, value);
    };
    Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeInt16LE(offset, value);
    };
    Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeInt16BE(offset, value);
    };
    Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeInt32LE(offset, value);
    };
    Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeInt32BE(offset, value);
    };
    Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeFloatLE(offset, value);
    };
    Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeFloatBE(offset, value);
    };
    Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeDoubleLE(offset, value);
    };
    Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
        if (noAssert === void 0) { noAssert = false; }
        offset += this.offset;
        this.data.writeDoubleBE(offset, value);
    };
    Buffer.isEncoding = function (enc) {
        try {
            string_util.FindUtil(enc);
        }
        catch (e) {
            return false;
        }
        return true;
    };
    Buffer.compare = function (a, b) {
        if (a === b) {
            return 0;
        }
        else {
            var i, aLen = a.length, bLen = b.length, cmpLength = Math.min(aLen, bLen), u1, u2;
            for (i = 0; i < cmpLength; i++) {
                u1 = a.readUInt8(i);
                u2 = b.readUInt8(i);
                if (u1 !== u2) {
                    return u1 > u2 ? 1 : -1;
                }
            }
            if (aLen === bLen) {
                return 0;
            }
            else {
                return aLen > bLen ? 1 : -1;
            }
        }
    };
    Buffer.isBuffer = function (obj) {
        return obj instanceof Buffer;
    };
    Buffer.byteLength = function (str, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        var strUtil = string_util.FindUtil(encoding);
        if (typeof (str) !== 'string') {
            str = "" + str;
        }
        return strUtil.byteLength(str);
    };
    Buffer.concat = function (list, totalLength) {
        var item;
        if (list.length === 0 || totalLength === 0) {
            return new Buffer(0);
        }
        else {
            if (totalLength == null) {
                totalLength = 0;
                for (var i = 0; i < list.length; i++) {
                    item = list[i];
                    totalLength += item.length;
                }
            }
            var buf = new Buffer(totalLength);
            var curPos = 0;
            for (var j = 0; j < list.length; j++) {
                item = list[j];
                curPos += item.copy(buf, curPos);
            }
            return buf;
        }
    };
    Buffer.prototype.equals = function (buffer) {
        var i;
        if (buffer.length !== this.length) {
            return false;
        }
        else {
            for (i = 0; i < this.length; i++) {
                if (this.readUInt8(i) !== buffer.readUInt8(i)) {
                    return false;
                }
            }
        }
    };
    Buffer.prototype.compare = function (buffer) {
        return Buffer.compare(this, buffer);
    };
    return Buffer;
})();
exports.Buffer = Buffer;
var _ = Buffer;

},{"./buffer_core":14,"./buffer_core_array":15,"./buffer_core_arraybuffer":16,"./buffer_core_imagedata":17,"./string_util":26}],14:[function(require,module,exports){
/**
 * !!!NOTE: This file should not depend on any other file!!!
 *
 * Buffers are referenced everywhere, so it can cause a circular dependency.
 */
var FLOAT_POS_INFINITY = Math.pow(2, 128);
var FLOAT_NEG_INFINITY = -1 * FLOAT_POS_INFINITY;
var FLOAT_POS_INFINITY_AS_INT = 0x7F800000;
var FLOAT_NEG_INFINITY_AS_INT = -8388608;
var FLOAT_NaN_AS_INT = 0x7fc00000;
var BufferCoreCommon = (function () {
    function BufferCoreCommon() {
    }
    BufferCoreCommon.prototype.getLength = function () {
        throw new Error('BufferCore implementations should implement getLength.');
    };
    BufferCoreCommon.prototype.writeInt8 = function (i, data) {
        this.writeUInt8(i, (data & 0xFF) | ((data & 0x80000000) >>> 24));
    };
    BufferCoreCommon.prototype.writeInt16LE = function (i, data) {
        this.writeUInt8(i, data & 0xFF);
        this.writeUInt8(i + 1, ((data >>> 8) & 0xFF) | ((data & 0x80000000) >>> 24));
    };
    BufferCoreCommon.prototype.writeInt16BE = function (i, data) {
        this.writeUInt8(i + 1, data & 0xFF);
        this.writeUInt8(i, ((data >>> 8) & 0xFF) | ((data & 0x80000000) >>> 24));
    };
    BufferCoreCommon.prototype.writeInt32LE = function (i, data) {
        this.writeUInt8(i, data & 0xFF);
        this.writeUInt8(i + 1, (data >>> 8) & 0xFF);
        this.writeUInt8(i + 2, (data >>> 16) & 0xFF);
        this.writeUInt8(i + 3, (data >>> 24) & 0xFF);
    };
    BufferCoreCommon.prototype.writeInt32BE = function (i, data) {
        this.writeUInt8(i + 3, data & 0xFF);
        this.writeUInt8(i + 2, (data >>> 8) & 0xFF);
        this.writeUInt8(i + 1, (data >>> 16) & 0xFF);
        this.writeUInt8(i, (data >>> 24) & 0xFF);
    };
    BufferCoreCommon.prototype.writeUInt8 = function (i, data) {
        throw new Error('BufferCore implementations should implement writeUInt8.');
    };
    BufferCoreCommon.prototype.writeUInt16LE = function (i, data) {
        this.writeUInt8(i, data & 0xFF);
        this.writeUInt8(i + 1, (data >> 8) & 0xFF);
    };
    BufferCoreCommon.prototype.writeUInt16BE = function (i, data) {
        this.writeUInt8(i + 1, data & 0xFF);
        this.writeUInt8(i, (data >> 8) & 0xFF);
    };
    BufferCoreCommon.prototype.writeUInt32LE = function (i, data) {
        this.writeInt32LE(i, data | 0);
    };
    BufferCoreCommon.prototype.writeUInt32BE = function (i, data) {
        this.writeInt32BE(i, data | 0);
    };
    BufferCoreCommon.prototype.writeFloatLE = function (i, data) {
        this.writeInt32LE(i, this.float2intbits(data));
    };
    BufferCoreCommon.prototype.writeFloatBE = function (i, data) {
        this.writeInt32BE(i, this.float2intbits(data));
    };
    BufferCoreCommon.prototype.writeDoubleLE = function (i, data) {
        var doubleBits = this.double2longbits(data);
        this.writeInt32LE(i, doubleBits[0]);
        this.writeInt32LE(i + 4, doubleBits[1]);
    };
    BufferCoreCommon.prototype.writeDoubleBE = function (i, data) {
        var doubleBits = this.double2longbits(data);
        this.writeInt32BE(i + 4, doubleBits[0]);
        this.writeInt32BE(i, doubleBits[1]);
    };
    BufferCoreCommon.prototype.readInt8 = function (i) {
        var val = this.readUInt8(i);
        if (val & 0x80) {
            return val | 0xFFFFFF80;
        }
        else {
            return val;
        }
    };
    BufferCoreCommon.prototype.readInt16LE = function (i) {
        var val = this.readUInt16LE(i);
        if (val & 0x8000) {
            return val | 0xFFFF8000;
        }
        else {
            return val;
        }
    };
    BufferCoreCommon.prototype.readInt16BE = function (i) {
        var val = this.readUInt16BE(i);
        if (val & 0x8000) {
            return val | 0xFFFF8000;
        }
        else {
            return val;
        }
    };
    BufferCoreCommon.prototype.readInt32LE = function (i) {
        return this.readUInt32LE(i) | 0;
    };
    BufferCoreCommon.prototype.readInt32BE = function (i) {
        return this.readUInt32BE(i) | 0;
    };
    BufferCoreCommon.prototype.readUInt8 = function (i) {
        throw new Error('BufferCore implementations should implement readUInt8.');
    };
    BufferCoreCommon.prototype.readUInt16LE = function (i) {
        return (this.readUInt8(i + 1) << 8) | this.readUInt8(i);
    };
    BufferCoreCommon.prototype.readUInt16BE = function (i) {
        return (this.readUInt8(i) << 8) | this.readUInt8(i + 1);
    };
    BufferCoreCommon.prototype.readUInt32LE = function (i) {
        return ((this.readUInt8(i + 3) << 24) | (this.readUInt8(i + 2) << 16) | (this.readUInt8(i + 1) << 8) | this.readUInt8(i)) >>> 0;
    };
    BufferCoreCommon.prototype.readUInt32BE = function (i) {
        return ((this.readUInt8(i) << 24) | (this.readUInt8(i + 1) << 16) | (this.readUInt8(i + 2) << 8) | this.readUInt8(i + 3)) >>> 0;
    };
    BufferCoreCommon.prototype.readFloatLE = function (i) {
        return this.intbits2float(this.readInt32LE(i));
    };
    BufferCoreCommon.prototype.readFloatBE = function (i) {
        return this.intbits2float(this.readInt32BE(i));
    };
    BufferCoreCommon.prototype.readDoubleLE = function (i) {
        return this.longbits2double(this.readInt32LE(i + 4), this.readInt32LE(i));
    };
    BufferCoreCommon.prototype.readDoubleBE = function (i) {
        return this.longbits2double(this.readInt32BE(i), this.readInt32BE(i + 4));
    };
    BufferCoreCommon.prototype.copy = function (start, end) {
        throw new Error('BufferCore implementations should implement copy.');
    };
    BufferCoreCommon.prototype.fill = function (value, start, end) {
        for (var i = start; i < end; i++) {
            this.writeUInt8(i, value);
        }
    };
    BufferCoreCommon.prototype.float2intbits = function (f_val) {
        var exp, f_view, i_view, sig, sign;
        if (f_val === 0) {
            return 0;
        }
        if (f_val === Number.POSITIVE_INFINITY) {
            return FLOAT_POS_INFINITY_AS_INT;
        }
        if (f_val === Number.NEGATIVE_INFINITY) {
            return FLOAT_NEG_INFINITY_AS_INT;
        }
        if (isNaN(f_val)) {
            return FLOAT_NaN_AS_INT;
        }
        sign = f_val < 0 ? 1 : 0;
        f_val = Math.abs(f_val);
        if (f_val <= 1.1754942106924411e-38 && f_val >= 1.4012984643248170e-45) {
            exp = 0;
            sig = Math.round((f_val / Math.pow(2, -126)) * Math.pow(2, 23));
            return (sign << 31) | (exp << 23) | sig;
        }
        else {
            exp = Math.floor(Math.log(f_val) / Math.LN2);
            sig = Math.round((f_val / Math.pow(2, exp) - 1) * Math.pow(2, 23));
            return (sign << 31) | ((exp + 127) << 23) | sig;
        }
    };
    BufferCoreCommon.prototype.double2longbits = function (d_val) {
        var d_view, exp, high_bits, i_view, sig, sign;
        if (d_val === 0) {
            return [0, 0];
        }
        if (d_val === Number.POSITIVE_INFINITY) {
            return [0, 2146435072];
        }
        else if (d_val === Number.NEGATIVE_INFINITY) {
            return [0, -1048576];
        }
        else if (isNaN(d_val)) {
            return [0, 2146959360];
        }
        sign = d_val < 0 ? 1 << 31 : 0;
        d_val = Math.abs(d_val);
        if (d_val <= 2.2250738585072010e-308 && d_val >= 5.0000000000000000e-324) {
            exp = 0;
            sig = (d_val / Math.pow(2, -1022)) * Math.pow(2, 52);
        }
        else {
            exp = Math.floor(Math.log(d_val) / Math.LN2);
            if (d_val < Math.pow(2, exp)) {
                exp = exp - 1;
            }
            sig = (d_val / Math.pow(2, exp) - 1) * Math.pow(2, 52);
            exp = (exp + 1023) << 20;
        }
        high_bits = ((sig * Math.pow(2, -32)) | 0) | sign | exp;
        return [sig & 0xFFFF, high_bits];
    };
    BufferCoreCommon.prototype.intbits2float = function (int32) {
        if (int32 === FLOAT_POS_INFINITY_AS_INT) {
            return Number.POSITIVE_INFINITY;
        }
        else if (int32 === FLOAT_NEG_INFINITY_AS_INT) {
            return Number.NEGATIVE_INFINITY;
        }
        var sign = (int32 & 0x80000000) >>> 31;
        var exponent = (int32 & 0x7F800000) >>> 23;
        var significand = int32 & 0x007FFFFF;
        var value;
        if (exponent === 0) {
            value = Math.pow(-1, sign) * significand * Math.pow(2, -149);
        }
        else {
            value = Math.pow(-1, sign) * (1 + significand * Math.pow(2, -23)) * Math.pow(2, exponent - 127);
        }
        if (value < FLOAT_NEG_INFINITY || value > FLOAT_POS_INFINITY) {
            value = NaN;
        }
        return value;
    };
    BufferCoreCommon.prototype.longbits2double = function (uint32_a, uint32_b) {
        var sign = (uint32_a & 0x80000000) >>> 31;
        var exponent = (uint32_a & 0x7FF00000) >>> 20;
        var significand = ((uint32_a & 0x000FFFFF) * Math.pow(2, 32)) + uint32_b;
        if (exponent === 0 && significand === 0) {
            return 0;
        }
        if (exponent === 2047) {
            if (significand === 0) {
                if (sign === 1) {
                    return Number.NEGATIVE_INFINITY;
                }
                return Number.POSITIVE_INFINITY;
            }
            else {
                return NaN;
            }
        }
        if (exponent === 0)
            return Math.pow(-1, sign) * significand * Math.pow(2, -1074);
        return Math.pow(-1, sign) * (1 + significand * Math.pow(2, -52)) * Math.pow(2, exponent - 1023);
    };
    return BufferCoreCommon;
})();
exports.BufferCoreCommon = BufferCoreCommon;

},{}],15:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var buffer_core = require('./buffer_core');
var clearMasks = [0xFFFFFF00, 0xFFFF00FF, 0xFF00FFFF, 0x00FFFFFF];
var BufferCoreArray = (function (_super) {
    __extends(BufferCoreArray, _super);
    function BufferCoreArray(length) {
        _super.call(this);
        this.length = length;
        this.buff = new Array(Math.ceil(length / 4));
        var bufflen = this.buff.length;
        for (var i = 0; i < bufflen; i++) {
            this.buff[i] = 0;
        }
    }
    BufferCoreArray.isAvailable = function () {
        return true;
    };
    BufferCoreArray.prototype.getLength = function () {
        return this.length;
    };
    BufferCoreArray.prototype.writeUInt8 = function (i, data) {
        data &= 0xFF;
        var arrIdx = i >> 2;
        var intIdx = i & 3;
        this.buff[arrIdx] = this.buff[arrIdx] & clearMasks[intIdx];
        this.buff[arrIdx] = this.buff[arrIdx] | (data << (intIdx << 3));
    };
    BufferCoreArray.prototype.readUInt8 = function (i) {
        var arrIdx = i >> 2;
        var intIdx = i & 3;
        return (this.buff[arrIdx] >> (intIdx << 3)) & 0xFF;
    };
    BufferCoreArray.prototype.copy = function (start, end) {
        var newBC = new BufferCoreArray(end - start);
        for (var i = start; i < end; i++) {
            newBC.writeUInt8(i - start, this.readUInt8(i));
        }
        return newBC;
    };
    BufferCoreArray.name = "Array";
    return BufferCoreArray;
})(buffer_core.BufferCoreCommon);
exports.BufferCoreArray = BufferCoreArray;
var _ = BufferCoreArray;

},{"./buffer_core":14}],16:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var buffer_core = require('./buffer_core');
var BufferCoreArrayBuffer = (function (_super) {
    __extends(BufferCoreArrayBuffer, _super);
    function BufferCoreArrayBuffer(arg1) {
        _super.call(this);
        if (typeof arg1 === 'number') {
            this.buff = new DataView(new ArrayBuffer(arg1));
        }
        else if (arg1 instanceof DataView) {
            this.buff = arg1;
        }
        else {
            this.buff = new DataView(arg1);
        }
        this.length = this.buff.byteLength;
    }
    BufferCoreArrayBuffer.isAvailable = function () {
        return typeof DataView !== 'undefined';
    };
    BufferCoreArrayBuffer.prototype.getLength = function () {
        return this.length;
    };
    BufferCoreArrayBuffer.prototype.writeInt8 = function (i, data) {
        this.buff.setInt8(i, data);
    };
    BufferCoreArrayBuffer.prototype.writeInt16LE = function (i, data) {
        this.buff.setInt16(i, data, true);
    };
    BufferCoreArrayBuffer.prototype.writeInt16BE = function (i, data) {
        this.buff.setInt16(i, data, false);
    };
    BufferCoreArrayBuffer.prototype.writeInt32LE = function (i, data) {
        this.buff.setInt32(i, data, true);
    };
    BufferCoreArrayBuffer.prototype.writeInt32BE = function (i, data) {
        this.buff.setInt32(i, data, false);
    };
    BufferCoreArrayBuffer.prototype.writeUInt8 = function (i, data) {
        this.buff.setUint8(i, data);
    };
    BufferCoreArrayBuffer.prototype.writeUInt16LE = function (i, data) {
        this.buff.setUint16(i, data, true);
    };
    BufferCoreArrayBuffer.prototype.writeUInt16BE = function (i, data) {
        this.buff.setUint16(i, data, false);
    };
    BufferCoreArrayBuffer.prototype.writeUInt32LE = function (i, data) {
        this.buff.setUint32(i, data, true);
    };
    BufferCoreArrayBuffer.prototype.writeUInt32BE = function (i, data) {
        this.buff.setUint32(i, data, false);
    };
    BufferCoreArrayBuffer.prototype.writeFloatLE = function (i, data) {
        this.buff.setFloat32(i, data, true);
    };
    BufferCoreArrayBuffer.prototype.writeFloatBE = function (i, data) {
        this.buff.setFloat32(i, data, false);
    };
    BufferCoreArrayBuffer.prototype.writeDoubleLE = function (i, data) {
        this.buff.setFloat64(i, data, true);
    };
    BufferCoreArrayBuffer.prototype.writeDoubleBE = function (i, data) {
        this.buff.setFloat64(i, data, false);
    };
    BufferCoreArrayBuffer.prototype.readInt8 = function (i) {
        return this.buff.getInt8(i);
    };
    BufferCoreArrayBuffer.prototype.readInt16LE = function (i) {
        return this.buff.getInt16(i, true);
    };
    BufferCoreArrayBuffer.prototype.readInt16BE = function (i) {
        return this.buff.getInt16(i, false);
    };
    BufferCoreArrayBuffer.prototype.readInt32LE = function (i) {
        return this.buff.getInt32(i, true);
    };
    BufferCoreArrayBuffer.prototype.readInt32BE = function (i) {
        return this.buff.getInt32(i, false);
    };
    BufferCoreArrayBuffer.prototype.readUInt8 = function (i) {
        return this.buff.getUint8(i);
    };
    BufferCoreArrayBuffer.prototype.readUInt16LE = function (i) {
        return this.buff.getUint16(i, true);
    };
    BufferCoreArrayBuffer.prototype.readUInt16BE = function (i) {
        return this.buff.getUint16(i, false);
    };
    BufferCoreArrayBuffer.prototype.readUInt32LE = function (i) {
        return this.buff.getUint32(i, true);
    };
    BufferCoreArrayBuffer.prototype.readUInt32BE = function (i) {
        return this.buff.getUint32(i, false);
    };
    BufferCoreArrayBuffer.prototype.readFloatLE = function (i) {
        return this.buff.getFloat32(i, true);
    };
    BufferCoreArrayBuffer.prototype.readFloatBE = function (i) {
        return this.buff.getFloat32(i, false);
    };
    BufferCoreArrayBuffer.prototype.readDoubleLE = function (i) {
        return this.buff.getFloat64(i, true);
    };
    BufferCoreArrayBuffer.prototype.readDoubleBE = function (i) {
        return this.buff.getFloat64(i, false);
    };
    BufferCoreArrayBuffer.prototype.copy = function (start, end) {
        var aBuff = this.buff.buffer;
        var newBuff;
        if (ArrayBuffer.prototype.slice) {
            newBuff = aBuff.slice(start, end);
        }
        else {
            var len = end - start;
            newBuff = new ArrayBuffer(len);
            var newUintArray = new Uint8Array(newBuff);
            var oldUintArray = new Uint8Array(aBuff);
            newUintArray.set(oldUintArray.subarray(start, end));
        }
        return new BufferCoreArrayBuffer(newBuff);
    };
    BufferCoreArrayBuffer.prototype.fill = function (value, start, end) {
        value = value & 0xFF;
        var i;
        var len = end - start;
        var intBytes = (((len) / 4) | 0) * 4;
        var intVal = (value << 24) | (value << 16) | (value << 8) | value;
        for (i = 0; i < intBytes; i += 4) {
            this.writeInt32LE(i + start, intVal);
        }
        for (i = intBytes; i < len; i++) {
            this.writeUInt8(i + start, value);
        }
    };
    BufferCoreArrayBuffer.prototype.getDataView = function () {
        return this.buff;
    };
    BufferCoreArrayBuffer.name = "ArrayBuffer";
    return BufferCoreArrayBuffer;
})(buffer_core.BufferCoreCommon);
exports.BufferCoreArrayBuffer = BufferCoreArrayBuffer;
var _ = BufferCoreArrayBuffer;

},{"./buffer_core":14}],17:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var buffer_core = require('./buffer_core');
var BufferCoreImageData = (function (_super) {
    __extends(BufferCoreImageData, _super);
    function BufferCoreImageData(length) {
        _super.call(this);
        this.length = length;
        this.buff = BufferCoreImageData.getCanvasPixelArray(length);
    }
    BufferCoreImageData.getCanvasPixelArray = function (bytes) {
        var ctx = BufferCoreImageData.imageDataFactory;
        if (ctx === undefined) {
            BufferCoreImageData.imageDataFactory = ctx = document.createElement('canvas').getContext('2d');
        }
        if (bytes === 0)
            bytes = 1;
        return ctx.createImageData(Math.ceil(bytes / 4), 1).data;
    };
    BufferCoreImageData.isAvailable = function () {
        return typeof CanvasPixelArray !== 'undefined';
    };
    BufferCoreImageData.prototype.getLength = function () {
        return this.length;
    };
    BufferCoreImageData.prototype.writeUInt8 = function (i, data) {
        this.buff[i] = data;
    };
    BufferCoreImageData.prototype.readUInt8 = function (i) {
        return this.buff[i];
    };
    BufferCoreImageData.prototype.copy = function (start, end) {
        var newBC = new BufferCoreImageData(end - start);
        for (var i = start; i < end; i++) {
            newBC.writeUInt8(i - start, this.buff[i]);
        }
        return newBC;
    };
    BufferCoreImageData.name = "ImageData";
    return BufferCoreImageData;
})(buffer_core.BufferCoreCommon);
exports.BufferCoreImageData = BufferCoreImageData;
var _ = BufferCoreImageData;

},{"./buffer_core":14}],18:[function(require,module,exports){
var api_error = require('./api_error');
var ApiError = api_error.ApiError;
var ErrorCode = api_error.ErrorCode;
var BaseFile = (function () {
    function BaseFile() {
    }
    BaseFile.prototype.sync = function (cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFile.prototype.syncSync = function () {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFile.prototype.datasync = function (cb) {
        this.sync(cb);
    };
    BaseFile.prototype.datasyncSync = function () {
        return this.syncSync();
    };
    BaseFile.prototype.chown = function (uid, gid, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFile.prototype.chownSync = function (uid, gid) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFile.prototype.chmod = function (mode, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFile.prototype.chmodSync = function (mode) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFile.prototype.utimes = function (atime, mtime, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFile.prototype.utimesSync = function (atime, mtime) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    return BaseFile;
})();
exports.BaseFile = BaseFile;

},{"./api_error":11}],19:[function(require,module,exports){
var api_error = require('./api_error');
(function (ActionType) {
    ActionType[ActionType["NOP"] = 0] = "NOP";
    ActionType[ActionType["THROW_EXCEPTION"] = 1] = "THROW_EXCEPTION";
    ActionType[ActionType["TRUNCATE_FILE"] = 2] = "TRUNCATE_FILE";
    ActionType[ActionType["CREATE_FILE"] = 3] = "CREATE_FILE";
})(exports.ActionType || (exports.ActionType = {}));
var ActionType = exports.ActionType;
var FileFlag = (function () {
    function FileFlag(flagStr) {
        this.flagStr = flagStr;
        if (FileFlag.validFlagStrs.indexOf(flagStr) < 0) {
            throw new api_error.ApiError(api_error.ErrorCode.EINVAL, "Invalid flag: " + flagStr);
        }
    }
    FileFlag.getFileFlag = function (flagStr) {
        if (FileFlag.flagCache.hasOwnProperty(flagStr)) {
            return FileFlag.flagCache[flagStr];
        }
        return FileFlag.flagCache[flagStr] = new FileFlag(flagStr);
    };
    FileFlag.prototype.getFlagString = function () {
        return this.flagStr;
    };
    FileFlag.prototype.isReadable = function () {
        return this.flagStr.indexOf('r') !== -1 || this.flagStr.indexOf('+') !== -1;
    };
    FileFlag.prototype.isWriteable = function () {
        return this.flagStr.indexOf('w') !== -1 || this.flagStr.indexOf('a') !== -1 || this.flagStr.indexOf('+') !== -1;
    };
    FileFlag.prototype.isTruncating = function () {
        return this.flagStr.indexOf('w') !== -1;
    };
    FileFlag.prototype.isAppendable = function () {
        return this.flagStr.indexOf('a') !== -1;
    };
    FileFlag.prototype.isSynchronous = function () {
        return this.flagStr.indexOf('s') !== -1;
    };
    FileFlag.prototype.isExclusive = function () {
        return this.flagStr.indexOf('x') !== -1;
    };
    FileFlag.prototype.pathExistsAction = function () {
        if (this.isExclusive()) {
            return ActionType.THROW_EXCEPTION;
        }
        else if (this.isTruncating()) {
            return ActionType.TRUNCATE_FILE;
        }
        else {
            return ActionType.NOP;
        }
    };
    FileFlag.prototype.pathNotExistsAction = function () {
        if ((this.isWriteable() || this.isAppendable()) && this.flagStr !== 'r+') {
            return ActionType.CREATE_FILE;
        }
        else {
            return ActionType.THROW_EXCEPTION;
        }
    };
    FileFlag.flagCache = {};
    FileFlag.validFlagStrs = ['r', 'r+', 'rs', 'rs+', 'w', 'wx', 'w+', 'wx+', 'a', 'ax', 'a+', 'ax+'];
    return FileFlag;
})();
exports.FileFlag = FileFlag;

},{"./api_error":11}],20:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var api_error = require('./api_error');
var file_flag = require('./file_flag');
var path = require('./node_path');
var buffer = require('./buffer');
var ApiError = api_error.ApiError;
var ErrorCode = api_error.ErrorCode;
var Buffer = buffer.Buffer;
var ActionType = file_flag.ActionType;
var BaseFileSystem = (function () {
    function BaseFileSystem() {
    }
    BaseFileSystem.prototype.supportsLinks = function () {
        return false;
    };
    BaseFileSystem.prototype.diskSpace = function (p, cb) {
        cb(0, 0);
    };
    BaseFileSystem.prototype.openFile = function (p, flag, cb) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.createFile = function (p, flag, mode, cb) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.open = function (p, flag, mode, cb) {
        var _this = this;
        var must_be_file = function (e, stats) {
            if (e) {
                switch (flag.pathNotExistsAction()) {
                    case ActionType.CREATE_FILE:
                        return _this.stat(path.dirname(p), false, function (e, parentStats) {
                            if (e) {
                                cb(e);
                            }
                            else if (!parentStats.isDirectory()) {
                                cb(new ApiError(ErrorCode.ENOTDIR, path.dirname(p) + " is not a directory."));
                            }
                            else {
                                _this.createFile(p, flag, mode, cb);
                            }
                        });
                    case ActionType.THROW_EXCEPTION:
                        return cb(new ApiError(ErrorCode.ENOENT, "" + p + " doesn't exist."));
                    default:
                        return cb(new ApiError(ErrorCode.EINVAL, 'Invalid FileFlag object.'));
                }
            }
            else {
                if (stats.isDirectory()) {
                    return cb(new ApiError(ErrorCode.EISDIR, p + " is a directory."));
                }
                switch (flag.pathExistsAction()) {
                    case ActionType.THROW_EXCEPTION:
                        return cb(new ApiError(ErrorCode.EEXIST, p + " already exists."));
                    case ActionType.TRUNCATE_FILE:
                        return _this.openFile(p, flag, function (e, fd) {
                            if (e) {
                                cb(e);
                            }
                            else {
                                fd.truncate(0, function () {
                                    fd.sync(function () {
                                        cb(null, fd);
                                    });
                                });
                            }
                        });
                    case ActionType.NOP:
                        return _this.openFile(p, flag, cb);
                    default:
                        return cb(new ApiError(ErrorCode.EINVAL, 'Invalid FileFlag object.'));
                }
            }
        };
        this.stat(p, false, must_be_file);
    };
    BaseFileSystem.prototype.rename = function (oldPath, newPath, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.renameSync = function (oldPath, newPath) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.stat = function (p, isLstat, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.statSync = function (p, isLstat) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.openFileSync = function (p, flag) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.createFileSync = function (p, flag, mode) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.openSync = function (p, flag, mode) {
        var stats;
        try {
            stats = this.statSync(p, false);
        }
        catch (e) {
            switch (flag.pathNotExistsAction()) {
                case ActionType.CREATE_FILE:
                    var parentStats = this.statSync(path.dirname(p), false);
                    if (!parentStats.isDirectory()) {
                        throw new ApiError(ErrorCode.ENOTDIR, path.dirname(p) + " is not a directory.");
                    }
                    return this.createFileSync(p, flag, mode);
                case ActionType.THROW_EXCEPTION:
                    throw new ApiError(ErrorCode.ENOENT, "" + p + " doesn't exist.");
                default:
                    throw new ApiError(ErrorCode.EINVAL, 'Invalid FileFlag object.');
            }
        }
        if (stats.isDirectory()) {
            throw new ApiError(ErrorCode.EISDIR, p + " is a directory.");
        }
        switch (flag.pathExistsAction()) {
            case ActionType.THROW_EXCEPTION:
                throw new ApiError(ErrorCode.EEXIST, p + " already exists.");
            case ActionType.TRUNCATE_FILE:
                this.unlinkSync(p);
                return this.createFileSync(p, flag, stats.mode);
            case ActionType.NOP:
                return this.openFileSync(p, flag);
            default:
                throw new ApiError(ErrorCode.EINVAL, 'Invalid FileFlag object.');
        }
    };
    BaseFileSystem.prototype.unlink = function (p, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.unlinkSync = function (p) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.rmdir = function (p, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.rmdirSync = function (p) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.mkdir = function (p, mode, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.mkdirSync = function (p, mode) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.readdir = function (p, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.readdirSync = function (p) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.exists = function (p, cb) {
        this.stat(p, null, function (err) {
            cb(err == null);
        });
    };
    BaseFileSystem.prototype.existsSync = function (p) {
        try {
            this.statSync(p, true);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    BaseFileSystem.prototype.realpath = function (p, cache, cb) {
        if (this.supportsLinks()) {
            var splitPath = p.split(path.sep);
            for (var i = 0; i < splitPath.length; i++) {
                var addPaths = splitPath.slice(0, i + 1);
                splitPath[i] = path.join.apply(null, addPaths);
            }
        }
        else {
            this.exists(p, function (doesExist) {
                if (doesExist) {
                    cb(null, p);
                }
                else {
                    cb(new ApiError(ErrorCode.ENOENT, "File " + p + " not found."));
                }
            });
        }
    };
    BaseFileSystem.prototype.realpathSync = function (p, cache) {
        if (this.supportsLinks()) {
            var splitPath = p.split(path.sep);
            for (var i = 0; i < splitPath.length; i++) {
                var addPaths = splitPath.slice(0, i + 1);
                splitPath[i] = path.join.apply(null, addPaths);
            }
        }
        else {
            if (this.existsSync(p)) {
                return p;
            }
            else {
                throw new ApiError(ErrorCode.ENOENT, "File " + p + " not found.");
            }
        }
    };
    BaseFileSystem.prototype.truncate = function (p, len, cb) {
        this.open(p, file_flag.FileFlag.getFileFlag('r+'), 0x1a4, (function (er, fd) {
            if (er) {
                return cb(er);
            }
            fd.truncate(len, (function (er) {
                fd.close((function (er2) {
                    cb(er || er2);
                }));
            }));
        }));
    };
    BaseFileSystem.prototype.truncateSync = function (p, len) {
        var fd = this.openSync(p, file_flag.FileFlag.getFileFlag('r+'), 0x1a4);
        try {
            fd.truncateSync(len);
        }
        catch (e) {
            throw e;
        }
        finally {
            fd.closeSync();
        }
    };
    BaseFileSystem.prototype.readFile = function (fname, encoding, flag, cb) {
        var oldCb = cb;
        this.open(fname, flag, 0x1a4, function (err, fd) {
            if (err) {
                return cb(err);
            }
            cb = function (err, arg) {
                fd.close(function (err2) {
                    if (err == null) {
                        err = err2;
                    }
                    return oldCb(err, arg);
                });
            };
            fd.stat(function (err, stat) {
                if (err != null) {
                    return cb(err);
                }
                var buf = new Buffer(stat.size);
                fd.read(buf, 0, stat.size, 0, function (err) {
                    if (err != null) {
                        return cb(err);
                    }
                    else if (encoding === null) {
                        return cb(err, buf);
                    }
                    try {
                        cb(null, buf.toString(encoding));
                    }
                    catch (e) {
                        cb(e);
                    }
                });
            });
        });
    };
    BaseFileSystem.prototype.readFileSync = function (fname, encoding, flag) {
        var fd = this.openSync(fname, flag, 0x1a4);
        try {
            var stat = fd.statSync();
            var buf = new Buffer(stat.size);
            fd.readSync(buf, 0, stat.size, 0);
            fd.closeSync();
            if (encoding === null) {
                return buf;
            }
            return buf.toString(encoding);
        }
        finally {
            fd.closeSync();
        }
    };
    BaseFileSystem.prototype.writeFile = function (fname, data, encoding, flag, mode, cb) {
        var oldCb = cb;
        this.open(fname, flag, 0x1a4, function (err, fd) {
            if (err != null) {
                return cb(err);
            }
            cb = function (err) {
                fd.close(function (err2) {
                    oldCb(err != null ? err : err2);
                });
            };
            try {
                if (typeof data === 'string') {
                    data = new Buffer(data, encoding);
                }
            }
            catch (e) {
                return cb(e);
            }
            fd.write(data, 0, data.length, 0, cb);
        });
    };
    BaseFileSystem.prototype.writeFileSync = function (fname, data, encoding, flag, mode) {
        var fd = this.openSync(fname, flag, mode);
        try {
            if (typeof data === 'string') {
                data = new Buffer(data, encoding);
            }
            fd.writeSync(data, 0, data.length, 0);
        }
        finally {
            fd.closeSync();
        }
    };
    BaseFileSystem.prototype.appendFile = function (fname, data, encoding, flag, mode, cb) {
        var oldCb = cb;
        this.open(fname, flag, mode, function (err, fd) {
            if (err != null) {
                return cb(err);
            }
            cb = function (err) {
                fd.close(function (err2) {
                    oldCb(err != null ? err : err2);
                });
            };
            if (typeof data === 'string') {
                data = new Buffer(data, encoding);
            }
            fd.write(data, 0, data.length, null, cb);
        });
    };
    BaseFileSystem.prototype.appendFileSync = function (fname, data, encoding, flag, mode) {
        var fd = this.openSync(fname, flag, mode);
        try {
            if (typeof data === 'string') {
                data = new Buffer(data, encoding);
            }
            fd.writeSync(data, 0, data.length, null);
        }
        finally {
            fd.closeSync();
        }
    };
    BaseFileSystem.prototype.chmod = function (p, isLchmod, mode, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.chmodSync = function (p, isLchmod, mode) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.chown = function (p, isLchown, uid, gid, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.chownSync = function (p, isLchown, uid, gid) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.utimes = function (p, atime, mtime, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.utimesSync = function (p, atime, mtime) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.link = function (srcpath, dstpath, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.linkSync = function (srcpath, dstpath) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.symlink = function (srcpath, dstpath, type, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.symlinkSync = function (srcpath, dstpath, type) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    BaseFileSystem.prototype.readlink = function (p, cb) {
        cb(new ApiError(ErrorCode.ENOTSUP));
    };
    BaseFileSystem.prototype.readlinkSync = function (p) {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    return BaseFileSystem;
})();
exports.BaseFileSystem = BaseFileSystem;
var SynchronousFileSystem = (function (_super) {
    __extends(SynchronousFileSystem, _super);
    function SynchronousFileSystem() {
        _super.apply(this, arguments);
    }
    SynchronousFileSystem.prototype.supportsSynch = function () {
        return true;
    };
    SynchronousFileSystem.prototype.rename = function (oldPath, newPath, cb) {
        try {
            this.renameSync(oldPath, newPath);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.stat = function (p, isLstat, cb) {
        try {
            cb(null, this.statSync(p, isLstat));
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.open = function (p, flags, mode, cb) {
        try {
            cb(null, this.openSync(p, flags, mode));
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.unlink = function (p, cb) {
        try {
            this.unlinkSync(p);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.rmdir = function (p, cb) {
        try {
            this.rmdirSync(p);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.mkdir = function (p, mode, cb) {
        try {
            this.mkdirSync(p, mode);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.readdir = function (p, cb) {
        try {
            cb(null, this.readdirSync(p));
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.chmod = function (p, isLchmod, mode, cb) {
        try {
            this.chmodSync(p, isLchmod, mode);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.chown = function (p, isLchown, uid, gid, cb) {
        try {
            this.chownSync(p, isLchown, uid, gid);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.utimes = function (p, atime, mtime, cb) {
        try {
            this.utimesSync(p, atime, mtime);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.link = function (srcpath, dstpath, cb) {
        try {
            this.linkSync(srcpath, dstpath);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.symlink = function (srcpath, dstpath, type, cb) {
        try {
            this.symlinkSync(srcpath, dstpath, type);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    SynchronousFileSystem.prototype.readlink = function (p, cb) {
        try {
            cb(null, this.readlinkSync(p));
        }
        catch (e) {
            cb(e);
        }
    };
    return SynchronousFileSystem;
})(BaseFileSystem);
exports.SynchronousFileSystem = SynchronousFileSystem;

},{"./api_error":11,"./buffer":13,"./file_flag":19,"./node_path":24}],21:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var buffer = require('./buffer');
var api_error = require('./api_error');
var Buffer = buffer.Buffer;
var ApiError = api_error.ApiError;
var ErrorCode = api_error.ErrorCode;
var BufferedEvent = (function () {
    function BufferedEvent(data, encoding, cb) {
        this.data = data;
        this.encoding = encoding;
        this.cb = cb;
        this.size = typeof (data) !== 'string' ? data.length : Buffer.byteLength(data, encoding != null ? encoding : undefined);
        if (typeof (this.data) !== 'string') {
            this.data = this.data.sliceCopy();
        }
    }
    BufferedEvent.prototype.getData = function (encoding) {
        if (encoding == null) {
            if (typeof (this.data) === 'string') {
                return new Buffer(this.data, this.encoding != null ? this.encoding : undefined);
            }
            else {
                return this.data;
            }
        }
        else {
            if (typeof (this.data) === 'string') {
                if (encoding === this.encoding) {
                    return this.data;
                }
                else {
                    return (new Buffer(this.data, this.encoding != null ? this.encoding : undefined)).toString(encoding);
                }
            }
            else {
                return this.data.toString(encoding);
            }
        }
    };
    return BufferedEvent;
})();
var AbstractEventEmitter = (function () {
    function AbstractEventEmitter() {
        this._listeners = {};
        this.maxListeners = 10;
    }
    AbstractEventEmitter.prototype.addListener = function (event, listener) {
        if (typeof (this._listeners[event]) === 'undefined') {
            this._listeners[event] = [];
        }
        if (this._listeners[event].push(listener) > this.maxListeners) {
            process.stdout.write("Warning: Event " + event + " has more than " + this.maxListeners + " listeners.\n");
        }
        this.emit('newListener', event, listener);
        return this;
    };
    AbstractEventEmitter.prototype.on = function (event, listener) {
        return this.addListener(event, listener);
    };
    AbstractEventEmitter.prototype.once = function (event, listener) {
        var fired = false, newListener = function () {
            this.removeListener(event, newListener);
            if (!fired) {
                fired = true;
                listener.apply(this, arguments);
            }
        };
        return this.addListener(event, newListener);
    };
    AbstractEventEmitter.prototype._emitRemoveListener = function (event, listeners) {
        var i;
        if (this._listeners['removeListener'] && this._listeners['removeListener'].length > 0) {
            for (i = 0; i < listeners.length; i++) {
                this.emit('removeListener', event, listeners[i]);
            }
        }
    };
    AbstractEventEmitter.prototype.removeListener = function (event, listener) {
        var listeners = this._listeners[event];
        if (typeof (listeners) !== 'undefined') {
            var idx = listeners.indexOf(listener);
            if (idx > -1) {
                listeners.splice(idx, 1);
            }
        }
        this.emit('removeListener', event, listener);
        return this;
    };
    AbstractEventEmitter.prototype.removeAllListeners = function (event) {
        var removed, keys, i;
        if (typeof (event) !== 'undefined') {
            removed = this._listeners[event];
            this._listeners[event] = [];
            this._emitRemoveListener(event, removed);
        }
        else {
            keys = Object.keys(this._listeners);
            for (i = 0; i < keys.length; i++) {
                this.removeAllListeners(keys[i]);
            }
        }
        return this;
    };
    AbstractEventEmitter.prototype.setMaxListeners = function (n) {
        this.maxListeners = n;
    };
    AbstractEventEmitter.prototype.listeners = function (event) {
        if (typeof (this._listeners[event]) === 'undefined') {
            this._listeners[event] = [];
        }
        return this._listeners[event].slice(0);
    };
    AbstractEventEmitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var listeners = this._listeners[event], rv = false;
        if (typeof (listeners) !== 'undefined') {
            var i;
            for (i = 0; i < listeners.length; i++) {
                rv = true;
                listeners[i].apply(this, args);
            }
        }
        return rv;
    };
    return AbstractEventEmitter;
})();
exports.AbstractEventEmitter = AbstractEventEmitter;
var AbstractDuplexStream = (function (_super) {
    __extends(AbstractDuplexStream, _super);
    function AbstractDuplexStream(writable, readable) {
        _super.call(this);
        this.writable = writable;
        this.readable = readable;
        this.encoding = null;
        this.flowing = false;
        this.buffer = [];
        this.endEvent = null;
        this.ended = false;
        this.drained = true;
    }
    AbstractDuplexStream.prototype.addListener = function (event, listener) {
        var rv = _super.prototype.addListener.call(this, event, listener), _this = this;
        if (event === 'data' && !this.flowing) {
            this.resume();
        }
        else if (event === 'readable' && this.buffer.length > 0) {
            setTimeout(function () {
                _this.emit('readable');
            }, 0);
        }
        return rv;
    };
    AbstractDuplexStream.prototype._processArgs = function (data, arg2, arg3) {
        if (typeof (arg2) === 'string') {
            return new BufferedEvent(data, arg2, arg3);
        }
        else {
            return new BufferedEvent(data, null, arg2);
        }
    };
    AbstractDuplexStream.prototype._processEvents = function () {
        var drained = this.buffer.length === 0;
        if (this.drained !== drained) {
            if (this.drained) {
                this.emit('readable');
            }
        }
        if (this.flowing && this.buffer.length !== 0) {
            this.emit('data', this.read());
        }
        this.drained = this.buffer.length === 0;
    };
    AbstractDuplexStream.prototype.emitEvent = function (type, event) {
        this.emit(type, event.getData(this.encoding));
        if (event.cb) {
            event.cb();
        }
    };
    AbstractDuplexStream.prototype.write = function (data, arg2, arg3) {
        if (this.ended) {
            throw new ApiError(ErrorCode.EPERM, 'Cannot write to an ended stream.');
        }
        var event = this._processArgs(data, arg2, arg3);
        this._push(event);
        return this.flowing;
    };
    AbstractDuplexStream.prototype.end = function (data, arg2, arg3) {
        if (this.ended) {
            throw new ApiError(ErrorCode.EPERM, 'Stream is already closed.');
        }
        var event = this._processArgs(data, arg2, arg3);
        this.ended = true;
        this.endEvent = event;
        this._processEvents();
    };
    AbstractDuplexStream.prototype.read = function (size) {
        var events = [], eventsCbs = [], lastCb, eventsSize = 0, event, buff, trueSize, i = 0, sizeUnspecified = typeof (size) !== 'number';
        if (sizeUnspecified)
            size = 4294967295;
        for (i = 0; i < this.buffer.length && eventsSize < size; i++) {
            event = this.buffer[i];
            events.push(event.getData());
            if (event.cb) {
                eventsCbs.push(event.cb);
            }
            eventsSize += event.size;
            lastCb = event.cb;
        }
        if (!sizeUnspecified && eventsSize < size) {
            return null;
        }
        this.buffer = this.buffer.slice(events.length);
        trueSize = eventsSize > size ? size : eventsSize;
        buff = Buffer.concat(events);
        if (eventsSize > size) {
            if (lastCb)
                eventsCbs.pop();
            this._push(new BufferedEvent(buff.slice(size), null, lastCb));
        }
        if (eventsCbs.length > 0) {
            setTimeout(function () {
                var i;
                for (i = 0; i < eventsCbs.length; i++) {
                    eventsCbs[i]();
                }
            }, 0);
        }
        if (this.ended && this.buffer.length === 0 && this.endEvent !== null) {
            var endEvent = this.endEvent, _this = this;
            this.endEvent = null;
            setTimeout(function () {
                _this.emitEvent('end', endEvent);
            }, 0);
        }
        if (events.length === 0) {
            this.emit('_read');
            return null;
        }
        else if (this.encoding === null) {
            return buff.slice(0, trueSize);
        }
        else {
            return buff.toString(this.encoding, 0, trueSize);
        }
    };
    AbstractDuplexStream.prototype.setEncoding = function (encoding) {
        this.encoding = encoding;
    };
    AbstractDuplexStream.prototype.pause = function () {
        this.flowing = false;
    };
    AbstractDuplexStream.prototype.resume = function () {
        this.flowing = true;
        this._processEvents();
    };
    AbstractDuplexStream.prototype.pipe = function (destination, options) {
        throw new ApiError(ErrorCode.EPERM, "Unimplemented.");
    };
    AbstractDuplexStream.prototype.unpipe = function (destination) { };
    AbstractDuplexStream.prototype.unshift = function (chunk) {
        if (this.ended) {
            throw new ApiError(ErrorCode.EPERM, "Stream has ended.");
        }
        this.buffer.unshift(new BufferedEvent(chunk, this.encoding));
        this._processEvents();
    };
    AbstractDuplexStream.prototype._push = function (event) {
        this.buffer.push(event);
        this._processEvents();
    };
    AbstractDuplexStream.prototype.wrap = function (stream) {
        throw new ApiError(ErrorCode.EPERM, "Unimplemented.");
    };
    return AbstractDuplexStream;
})(AbstractEventEmitter);
exports.AbstractDuplexStream = AbstractDuplexStream;

},{"./api_error":11,"./buffer":13}],22:[function(require,module,exports){
var api_error = require('./api_error');
var file_flag = require('./file_flag');
var buffer = require('./buffer');
var path = require('./node_path');
var ApiError = api_error.ApiError;
var ErrorCode = api_error.ErrorCode;
var FileFlag = file_flag.FileFlag;
var Buffer = buffer.Buffer;
function wrapCb(cb, numArgs) {
    if (typeof cb !== 'function') {
        throw new ApiError(ErrorCode.EINVAL, 'Callback must be a function.');
    }
    if (typeof __numWaiting === 'undefined') {
        __numWaiting = 0;
    }
    __numWaiting++;
    switch (numArgs) {
        case 1:
            return function (arg1) {
                setImmediate(function () {
                    __numWaiting--;
                    return cb(arg1);
                });
            };
        case 2:
            return function (arg1, arg2) {
                setImmediate(function () {
                    __numWaiting--;
                    return cb(arg1, arg2);
                });
            };
        case 3:
            return function (arg1, arg2, arg3) {
                setImmediate(function () {
                    __numWaiting--;
                    return cb(arg1, arg2, arg3);
                });
            };
        default:
            throw new Error('Invalid invocation of wrapCb.');
    }
}
function checkFd(fd) {
    if (typeof fd['write'] !== 'function') {
        throw new ApiError(ErrorCode.EBADF, 'Invalid file descriptor.');
    }
}
function normalizeMode(mode, def) {
    switch (typeof mode) {
        case 'number':
            return mode;
        case 'string':
            var trueMode = parseInt(mode, 8);
            if (trueMode !== NaN) {
                return trueMode;
            }
        default:
            return def;
    }
}
function normalizePath(p) {
    if (p.indexOf('\u0000') >= 0) {
        throw new ApiError(ErrorCode.EINVAL, 'Path must be a string without null bytes.');
    }
    else if (p === '') {
        throw new ApiError(ErrorCode.EINVAL, 'Path must not be empty.');
    }
    return path.resolve(p);
}
function normalizeOptions(options, defEnc, defFlag, defMode) {
    switch (typeof options) {
        case 'object':
            return {
                encoding: typeof options['encoding'] !== 'undefined' ? options['encoding'] : defEnc,
                flag: typeof options['flag'] !== 'undefined' ? options['flag'] : defFlag,
                mode: normalizeMode(options['mode'], defMode)
            };
        case 'string':
            return {
                encoding: options,
                flag: defFlag,
                mode: defMode
            };
        default:
            return {
                encoding: defEnc,
                flag: defFlag,
                mode: defMode
            };
    }
}
function nopCb() { }
;
var fs = (function () {
    function fs() {
    }
    fs._initialize = function (rootFS) {
        if (!rootFS.constructor.isAvailable()) {
            throw new ApiError(ErrorCode.EINVAL, 'Tried to instantiate BrowserFS with an unavailable file system.');
        }
        return fs.root = rootFS;
    };
    fs._toUnixTimestamp = function (time) {
        if (typeof time === 'number') {
            return time;
        }
        else if (time instanceof Date) {
            return time.getTime() / 1000;
        }
        throw new Error("Cannot parse time: " + time);
    };
    fs.getRootFS = function () {
        if (fs.root) {
            return fs.root;
        }
        else {
            return null;
        }
    };
    fs.rename = function (oldPath, newPath, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            fs.root.rename(normalizePath(oldPath), normalizePath(newPath), newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.renameSync = function (oldPath, newPath) {
        fs.root.renameSync(normalizePath(oldPath), normalizePath(newPath));
    };
    fs.exists = function (path, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            return fs.root.exists(normalizePath(path), newCb);
        }
        catch (e) {
            return newCb(false);
        }
    };
    fs.existsSync = function (path) {
        try {
            return fs.root.existsSync(normalizePath(path));
        }
        catch (e) {
            return false;
        }
    };
    fs.stat = function (path, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 2);
        try {
            return fs.root.stat(normalizePath(path), false, newCb);
        }
        catch (e) {
            return newCb(e, null);
        }
    };
    fs.statSync = function (path) {
        return fs.root.statSync(normalizePath(path), false);
    };
    fs.lstat = function (path, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 2);
        try {
            return fs.root.stat(normalizePath(path), true, newCb);
        }
        catch (e) {
            return newCb(e, null);
        }
    };
    fs.lstatSync = function (path) {
        return fs.root.statSync(normalizePath(path), true);
    };
    fs.truncate = function (path, arg2, cb) {
        if (arg2 === void 0) { arg2 = 0; }
        if (cb === void 0) { cb = nopCb; }
        var len = 0;
        if (typeof arg2 === 'function') {
            cb = arg2;
        }
        else if (typeof arg2 === 'number') {
            len = arg2;
        }
        var newCb = wrapCb(cb, 1);
        try {
            if (len < 0) {
                throw new ApiError(ErrorCode.EINVAL);
            }
            return fs.root.truncate(normalizePath(path), len, newCb);
        }
        catch (e) {
            return newCb(e);
        }
    };
    fs.truncateSync = function (path, len) {
        if (len === void 0) { len = 0; }
        if (len < 0) {
            throw new ApiError(ErrorCode.EINVAL);
        }
        return fs.root.truncateSync(normalizePath(path), len);
    };
    fs.unlink = function (path, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            return fs.root.unlink(normalizePath(path), newCb);
        }
        catch (e) {
            return newCb(e);
        }
    };
    fs.unlinkSync = function (path) {
        return fs.root.unlinkSync(normalizePath(path));
    };
    fs.open = function (path, flag, arg2, cb) {
        if (cb === void 0) { cb = nopCb; }
        var mode = normalizeMode(arg2, 0x1a4);
        cb = typeof arg2 === 'function' ? arg2 : cb;
        var newCb = wrapCb(cb, 2);
        try {
            return fs.root.open(normalizePath(path), FileFlag.getFileFlag(flag), mode, newCb);
        }
        catch (e) {
            return newCb(e, null);
        }
    };
    fs.openSync = function (path, flag, mode) {
        if (mode === void 0) { mode = 0x1a4; }
        return fs.root.openSync(normalizePath(path), FileFlag.getFileFlag(flag), mode);
    };
    fs.readFile = function (filename, arg2, cb) {
        if (arg2 === void 0) { arg2 = {}; }
        if (cb === void 0) { cb = nopCb; }
        var options = normalizeOptions(arg2, null, 'r', null);
        cb = typeof arg2 === 'function' ? arg2 : cb;
        var newCb = wrapCb(cb, 2);
        try {
            var flag = FileFlag.getFileFlag(options['flag']);
            if (!flag.isReadable()) {
                return newCb(new ApiError(ErrorCode.EINVAL, 'Flag passed to readFile must allow for reading.'));
            }
            return fs.root.readFile(normalizePath(filename), options.encoding, flag, newCb);
        }
        catch (e) {
            return newCb(e, null);
        }
    };
    fs.readFileSync = function (filename, arg2) {
        if (arg2 === void 0) { arg2 = {}; }
        var options = normalizeOptions(arg2, null, 'r', null);
        var flag = FileFlag.getFileFlag(options.flag);
        if (!flag.isReadable()) {
            throw new ApiError(ErrorCode.EINVAL, 'Flag passed to readFile must allow for reading.');
        }
        return fs.root.readFileSync(normalizePath(filename), options.encoding, flag);
    };
    fs.writeFile = function (filename, data, arg3, cb) {
        if (arg3 === void 0) { arg3 = {}; }
        if (cb === void 0) { cb = nopCb; }
        var options = normalizeOptions(arg3, 'utf8', 'w', 0x1a4);
        cb = typeof arg3 === 'function' ? arg3 : cb;
        var newCb = wrapCb(cb, 1);
        try {
            var flag = FileFlag.getFileFlag(options.flag);
            if (!flag.isWriteable()) {
                return newCb(new ApiError(ErrorCode.EINVAL, 'Flag passed to writeFile must allow for writing.'));
            }
            return fs.root.writeFile(normalizePath(filename), data, options.encoding, flag, options.mode, newCb);
        }
        catch (e) {
            return newCb(e);
        }
    };
    fs.writeFileSync = function (filename, data, arg3) {
        var options = normalizeOptions(arg3, 'utf8', 'w', 0x1a4);
        var flag = FileFlag.getFileFlag(options.flag);
        if (!flag.isWriteable()) {
            throw new ApiError(ErrorCode.EINVAL, 'Flag passed to writeFile must allow for writing.');
        }
        return fs.root.writeFileSync(normalizePath(filename), data, options.encoding, flag, options.mode);
    };
    fs.appendFile = function (filename, data, arg3, cb) {
        if (cb === void 0) { cb = nopCb; }
        var options = normalizeOptions(arg3, 'utf8', 'a', 0x1a4);
        cb = typeof arg3 === 'function' ? arg3 : cb;
        var newCb = wrapCb(cb, 1);
        try {
            var flag = FileFlag.getFileFlag(options.flag);
            if (!flag.isAppendable()) {
                return newCb(new ApiError(ErrorCode.EINVAL, 'Flag passed to appendFile must allow for appending.'));
            }
            fs.root.appendFile(normalizePath(filename), data, options.encoding, flag, options.mode, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.appendFileSync = function (filename, data, arg3) {
        var options = normalizeOptions(arg3, 'utf8', 'a', 0x1a4);
        var flag = FileFlag.getFileFlag(options.flag);
        if (!flag.isAppendable()) {
            throw new ApiError(ErrorCode.EINVAL, 'Flag passed to appendFile must allow for appending.');
        }
        return fs.root.appendFileSync(normalizePath(filename), data, options.encoding, flag, options.mode);
    };
    fs.fstat = function (fd, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 2);
        try {
            checkFd(fd);
            fd.stat(newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.fstatSync = function (fd) {
        checkFd(fd);
        return fd.statSync();
    };
    fs.close = function (fd, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            checkFd(fd);
            fd.close(newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.closeSync = function (fd) {
        checkFd(fd);
        return fd.closeSync();
    };
    fs.ftruncate = function (fd, arg2, cb) {
        if (cb === void 0) { cb = nopCb; }
        var length = typeof arg2 === 'number' ? arg2 : 0;
        cb = typeof arg2 === 'function' ? arg2 : cb;
        var newCb = wrapCb(cb, 1);
        try {
            checkFd(fd);
            if (length < 0) {
                throw new ApiError(ErrorCode.EINVAL);
            }
            fd.truncate(length, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.ftruncateSync = function (fd, len) {
        if (len === void 0) { len = 0; }
        checkFd(fd);
        return fd.truncateSync(len);
    };
    fs.fsync = function (fd, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            checkFd(fd);
            fd.sync(newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.fsyncSync = function (fd) {
        checkFd(fd);
        return fd.syncSync();
    };
    fs.fdatasync = function (fd, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            checkFd(fd);
            fd.datasync(newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.fdatasyncSync = function (fd) {
        checkFd(fd);
        fd.datasyncSync();
    };
    fs.write = function (fd, arg2, arg3, arg4, arg5, cb) {
        if (cb === void 0) { cb = nopCb; }
        var buffer, offset, length, position = null;
        if (typeof arg2 === 'string') {
            var encoding = 'utf8';
            switch (typeof arg3) {
                case 'function':
                    cb = arg3;
                    break;
                case 'number':
                    position = arg3;
                    encoding = typeof arg4 === 'string' ? arg4 : 'utf8';
                    cb = typeof arg5 === 'function' ? arg5 : cb;
                    break;
                default:
                    cb = typeof arg4 === 'function' ? arg4 : typeof arg5 === 'function' ? arg5 : cb;
                    return cb(new ApiError(ErrorCode.EINVAL, 'Invalid arguments.'));
            }
            buffer = new Buffer(arg2, encoding);
            offset = 0;
            length = buffer.length;
        }
        else {
            buffer = arg2;
            offset = arg3;
            length = arg4;
            position = typeof arg5 === 'number' ? arg5 : null;
            cb = typeof arg5 === 'function' ? arg5 : cb;
        }
        var newCb = wrapCb(cb, 3);
        try {
            checkFd(fd);
            if (position == null) {
                position = fd.getPos();
            }
            fd.write(buffer, offset, length, position, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.writeSync = function (fd, arg2, arg3, arg4, arg5) {
        var buffer, offset = 0, length, position;
        if (typeof arg2 === 'string') {
            position = typeof arg3 === 'number' ? arg3 : null;
            var encoding = typeof arg4 === 'string' ? arg4 : 'utf8';
            offset = 0;
            buffer = new Buffer(arg2, encoding);
            length = buffer.length;
        }
        else {
            buffer = arg2;
            offset = arg3;
            length = arg4;
            position = typeof arg5 === 'number' ? arg5 : null;
        }
        checkFd(fd);
        if (position == null) {
            position = fd.getPos();
        }
        return fd.writeSync(buffer, offset, length, position);
    };
    fs.read = function (fd, arg2, arg3, arg4, arg5, cb) {
        if (cb === void 0) { cb = nopCb; }
        var position, offset, length, buffer, newCb;
        if (typeof arg2 === 'number') {
            length = arg2;
            position = arg3;
            var encoding = arg4;
            cb = typeof arg5 === 'function' ? arg5 : cb;
            offset = 0;
            buffer = new Buffer(length);
            newCb = wrapCb((function (err, bytesRead, buf) {
                if (err) {
                    return cb(err);
                }
                cb(err, buf.toString(encoding), bytesRead);
            }), 3);
        }
        else {
            buffer = arg2;
            offset = arg3;
            length = arg4;
            position = arg5;
            newCb = wrapCb(cb, 3);
        }
        try {
            checkFd(fd);
            if (position == null) {
                position = fd.getPos();
            }
            fd.read(buffer, offset, length, position, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.readSync = function (fd, arg2, arg3, arg4, arg5) {
        var shenanigans = false;
        var buffer, offset, length, position;
        if (typeof arg2 === 'number') {
            length = arg2;
            position = arg3;
            var encoding = arg4;
            offset = 0;
            buffer = new Buffer(length);
            shenanigans = true;
        }
        else {
            buffer = arg2;
            offset = arg3;
            length = arg4;
            position = arg5;
        }
        checkFd(fd);
        if (position == null) {
            position = fd.getPos();
        }
        var rv = fd.readSync(buffer, offset, length, position);
        if (!shenanigans) {
            return rv;
        }
        else {
            return [buffer.toString(encoding), rv];
        }
    };
    fs.fchown = function (fd, uid, gid, callback) {
        if (callback === void 0) { callback = nopCb; }
        var newCb = wrapCb(callback, 1);
        try {
            checkFd(fd);
            fd.chown(uid, gid, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.fchownSync = function (fd, uid, gid) {
        checkFd(fd);
        return fd.chownSync(uid, gid);
    };
    fs.fchmod = function (fd, mode, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
            checkFd(fd);
            fd.chmod(mode, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.fchmodSync = function (fd, mode) {
        mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
        checkFd(fd);
        return fd.chmodSync(mode);
    };
    fs.futimes = function (fd, atime, mtime, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            checkFd(fd);
            if (typeof atime === 'number') {
                atime = new Date(atime * 1000);
            }
            if (typeof mtime === 'number') {
                mtime = new Date(mtime * 1000);
            }
            fd.utimes(atime, mtime, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.futimesSync = function (fd, atime, mtime) {
        checkFd(fd);
        if (typeof atime === 'number') {
            atime = new Date(atime * 1000);
        }
        if (typeof mtime === 'number') {
            mtime = new Date(mtime * 1000);
        }
        return fd.utimesSync(atime, mtime);
    };
    fs.rmdir = function (path, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            path = normalizePath(path);
            fs.root.rmdir(path, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.rmdirSync = function (path) {
        path = normalizePath(path);
        return fs.root.rmdirSync(path);
    };
    fs.mkdir = function (path, mode, cb) {
        if (cb === void 0) { cb = nopCb; }
        if (typeof mode === 'function') {
            cb = mode;
            mode = 0x1ff;
        }
        var newCb = wrapCb(cb, 1);
        try {
            path = normalizePath(path);
            fs.root.mkdir(path, mode, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.mkdirSync = function (path, mode) {
        if (mode === void 0) { mode = 0x1ff; }
        mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
        path = normalizePath(path);
        return fs.root.mkdirSync(path, mode);
    };
    fs.readdir = function (path, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 2);
        try {
            path = normalizePath(path);
            fs.root.readdir(path, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.readdirSync = function (path) {
        path = normalizePath(path);
        return fs.root.readdirSync(path);
    };
    fs.link = function (srcpath, dstpath, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            srcpath = normalizePath(srcpath);
            dstpath = normalizePath(dstpath);
            fs.root.link(srcpath, dstpath, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.linkSync = function (srcpath, dstpath) {
        srcpath = normalizePath(srcpath);
        dstpath = normalizePath(dstpath);
        return fs.root.linkSync(srcpath, dstpath);
    };
    fs.symlink = function (srcpath, dstpath, arg3, cb) {
        if (cb === void 0) { cb = nopCb; }
        var type = typeof arg3 === 'string' ? arg3 : 'file';
        cb = typeof arg3 === 'function' ? arg3 : cb;
        var newCb = wrapCb(cb, 1);
        try {
            if (type !== 'file' && type !== 'dir') {
                return newCb(new ApiError(ErrorCode.EINVAL, "Invalid type: " + type));
            }
            srcpath = normalizePath(srcpath);
            dstpath = normalizePath(dstpath);
            fs.root.symlink(srcpath, dstpath, type, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.symlinkSync = function (srcpath, dstpath, type) {
        if (type == null) {
            type = 'file';
        }
        else if (type !== 'file' && type !== 'dir') {
            throw new ApiError(ErrorCode.EINVAL, "Invalid type: " + type);
        }
        srcpath = normalizePath(srcpath);
        dstpath = normalizePath(dstpath);
        return fs.root.symlinkSync(srcpath, dstpath, type);
    };
    fs.readlink = function (path, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 2);
        try {
            path = normalizePath(path);
            fs.root.readlink(path, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.readlinkSync = function (path) {
        path = normalizePath(path);
        return fs.root.readlinkSync(path);
    };
    fs.chown = function (path, uid, gid, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            path = normalizePath(path);
            fs.root.chown(path, false, uid, gid, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.chownSync = function (path, uid, gid) {
        path = normalizePath(path);
        fs.root.chownSync(path, false, uid, gid);
    };
    fs.lchown = function (path, uid, gid, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            path = normalizePath(path);
            fs.root.chown(path, true, uid, gid, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.lchownSync = function (path, uid, gid) {
        path = normalizePath(path);
        return fs.root.chownSync(path, true, uid, gid);
    };
    fs.chmod = function (path, mode, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
            path = normalizePath(path);
            fs.root.chmod(path, false, mode, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.chmodSync = function (path, mode) {
        mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
        path = normalizePath(path);
        return fs.root.chmodSync(path, false, mode);
    };
    fs.lchmod = function (path, mode, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
            path = normalizePath(path);
            fs.root.chmod(path, true, mode, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.lchmodSync = function (path, mode) {
        path = normalizePath(path);
        mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
        return fs.root.chmodSync(path, true, mode);
    };
    fs.utimes = function (path, atime, mtime, cb) {
        if (cb === void 0) { cb = nopCb; }
        var newCb = wrapCb(cb, 1);
        try {
            path = normalizePath(path);
            if (typeof atime === 'number') {
                atime = new Date(atime * 1000);
            }
            if (typeof mtime === 'number') {
                mtime = new Date(mtime * 1000);
            }
            fs.root.utimes(path, atime, mtime, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.utimesSync = function (path, atime, mtime) {
        path = normalizePath(path);
        if (typeof atime === 'number') {
            atime = new Date(atime * 1000);
        }
        if (typeof mtime === 'number') {
            mtime = new Date(mtime * 1000);
        }
        return fs.root.utimesSync(path, atime, mtime);
    };
    fs.realpath = function (path, arg2, cb) {
        if (cb === void 0) { cb = nopCb; }
        var cache = typeof arg2 === 'object' ? arg2 : {};
        cb = typeof arg2 === 'function' ? arg2 : nopCb;
        var newCb = wrapCb(cb, 2);
        try {
            path = normalizePath(path);
            fs.root.realpath(path, cache, newCb);
        }
        catch (e) {
            newCb(e);
        }
    };
    fs.realpathSync = function (path, cache) {
        if (cache === void 0) { cache = {}; }
        path = normalizePath(path);
        return fs.root.realpathSync(path, cache);
    };
    fs.root = null;
    return fs;
})();
exports.fs = fs;

},{"./api_error":11,"./buffer":13,"./file_flag":19,"./node_path":24}],23:[function(require,module,exports){
var buffer = require('./buffer');
var Buffer = buffer.Buffer;
(function (FileType) {
    FileType[FileType["FILE"] = 32768] = "FILE";
    FileType[FileType["DIRECTORY"] = 16384] = "DIRECTORY";
    FileType[FileType["SYMLINK"] = 40960] = "SYMLINK";
})(exports.FileType || (exports.FileType = {}));
var FileType = exports.FileType;
var Stats = (function () {
    function Stats(item_type, size, mode, atime, mtime, ctime) {
        if (atime === void 0) { atime = new Date(); }
        if (mtime === void 0) { mtime = new Date(); }
        if (ctime === void 0) { ctime = new Date(); }
        this.size = size;
        this.mode = mode;
        this.atime = atime;
        this.mtime = mtime;
        this.ctime = ctime;
        this.dev = 0;
        this.ino = 0;
        this.rdev = 0;
        this.nlink = 1;
        this.blksize = 4096;
        this.uid = 0;
        this.gid = 0;
        this.birthtime = new Date(0);
        this.file_data = null;
        if (this.mode == null) {
            switch (item_type) {
                case FileType.FILE:
                    this.mode = 0x1a4;
                    break;
                case FileType.DIRECTORY:
                default:
                    this.mode = 0x1ff;
            }
        }
        this.blocks = Math.ceil(size / 512);
        if (this.mode < 0x1000) {
            this.mode |= item_type;
        }
    }
    Stats.prototype.toBuffer = function () {
        var buffer = new Buffer(32);
        buffer.writeUInt32LE(this.size, 0);
        buffer.writeUInt32LE(this.mode, 4);
        buffer.writeDoubleLE(this.atime.getTime(), 8);
        buffer.writeDoubleLE(this.mtime.getTime(), 16);
        buffer.writeDoubleLE(this.ctime.getTime(), 24);
        return buffer;
    };
    Stats.fromBuffer = function (buffer) {
        var size = buffer.readUInt32LE(0), mode = buffer.readUInt32LE(4), atime = buffer.readDoubleLE(8), mtime = buffer.readDoubleLE(16), ctime = buffer.readDoubleLE(24);
        return new Stats(mode & 0xF000, size, mode & 0xFFF, new Date(atime), new Date(mtime), new Date(ctime));
    };
    Stats.prototype.clone = function () {
        return new Stats(this.mode & 0xF000, this.size, this.mode & 0xFFF, this.atime, this.mtime, this.ctime);
    };
    Stats.prototype.isFile = function () {
        return (this.mode & 0xF000) === FileType.FILE;
    };
    Stats.prototype.isDirectory = function () {
        return (this.mode & 0xF000) === FileType.DIRECTORY;
    };
    Stats.prototype.isSymbolicLink = function () {
        return (this.mode & 0xF000) === FileType.SYMLINK;
    };
    Stats.prototype.chmod = function (mode) {
        this.mode = (this.mode & 0xF000) | mode;
    };
    Stats.prototype.isSocket = function () {
        return false;
    };
    Stats.prototype.isBlockDevice = function () {
        return false;
    };
    Stats.prototype.isCharacterDevice = function () {
        return false;
    };
    Stats.prototype.isFIFO = function () {
        return false;
    };
    return Stats;
})();
exports.Stats = Stats;

},{"./buffer":13}],24:[function(require,module,exports){
var node_process = require('./node_process');
var process = node_process.process;
var path = (function () {
    function path() {
    }
    path.normalize = function (p) {
        if (p === '') {
            p = '.';
        }
        var absolute = p.charAt(0) === path.sep;
        p = path._removeDuplicateSeps(p);
        var components = p.split(path.sep);
        var goodComponents = [];
        for (var idx = 0; idx < components.length; idx++) {
            var c = components[idx];
            if (c === '.') {
                continue;
            }
            else if (c === '..' && (absolute || (!absolute && goodComponents.length > 0 && goodComponents[0] !== '..'))) {
                goodComponents.pop();
            }
            else {
                goodComponents.push(c);
            }
        }
        if (!absolute && goodComponents.length < 2) {
            switch (goodComponents.length) {
                case 1:
                    if (goodComponents[0] === '') {
                        goodComponents.unshift('.');
                    }
                    break;
                default:
                    goodComponents.push('.');
            }
        }
        p = goodComponents.join(path.sep);
        if (absolute && p.charAt(0) !== path.sep) {
            p = path.sep + p;
        }
        return p;
    };
    path.join = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        var processed = [];
        for (var i = 0; i < paths.length; i++) {
            var segment = paths[i];
            if (typeof segment !== 'string') {
                throw new TypeError("Invalid argument type to path.join: " + (typeof segment));
            }
            else if (segment !== '') {
                processed.push(segment);
            }
        }
        return path.normalize(processed.join(path.sep));
    };
    path.resolve = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        var processed = [];
        for (var i = 0; i < paths.length; i++) {
            var p = paths[i];
            if (typeof p !== 'string') {
                throw new TypeError("Invalid argument type to path.join: " + (typeof p));
            }
            else if (p !== '') {
                if (p.charAt(0) === path.sep) {
                    processed = [];
                }
                processed.push(p);
            }
        }
        var resolved = path.normalize(processed.join(path.sep));
        if (resolved.length > 1 && resolved.charAt(resolved.length - 1) === path.sep) {
            return resolved.substr(0, resolved.length - 1);
        }
        if (resolved.charAt(0) !== path.sep) {
            if (resolved.charAt(0) === '.' && (resolved.length === 1 || resolved.charAt(1) === path.sep)) {
                resolved = resolved.length === 1 ? '' : resolved.substr(2);
            }
            var cwd = process.cwd();
            if (resolved !== '') {
                resolved = this.normalize(cwd + (cwd !== '/' ? path.sep : '') + resolved);
            }
            else {
                resolved = cwd;
            }
        }
        return resolved;
    };
    path.relative = function (from, to) {
        var i;
        from = path.resolve(from);
        to = path.resolve(to);
        var fromSegs = from.split(path.sep);
        var toSegs = to.split(path.sep);
        toSegs.shift();
        fromSegs.shift();
        var upCount = 0;
        var downSegs = [];
        for (i = 0; i < fromSegs.length; i++) {
            var seg = fromSegs[i];
            if (seg === toSegs[i]) {
                continue;
            }
            upCount = fromSegs.length - i;
            break;
        }
        downSegs = toSegs.slice(i);
        if (fromSegs.length === 1 && fromSegs[0] === '') {
            upCount = 0;
        }
        if (upCount > fromSegs.length) {
            upCount = fromSegs.length;
        }
        var rv = '';
        for (i = 0; i < upCount; i++) {
            rv += '../';
        }
        rv += downSegs.join(path.sep);
        if (rv.length > 1 && rv.charAt(rv.length - 1) === path.sep) {
            rv = rv.substr(0, rv.length - 1);
        }
        return rv;
    };
    path.dirname = function (p) {
        p = path._removeDuplicateSeps(p);
        var absolute = p.charAt(0) === path.sep;
        var sections = p.split(path.sep);
        if (sections.pop() === '' && sections.length > 0) {
            sections.pop();
        }
        if (sections.length > 1 || (sections.length === 1 && !absolute)) {
            return sections.join(path.sep);
        }
        else if (absolute) {
            return path.sep;
        }
        else {
            return '.';
        }
    };
    path.basename = function (p, ext) {
        if (ext === void 0) { ext = ""; }
        if (p === '') {
            return p;
        }
        p = path.normalize(p);
        var sections = p.split(path.sep);
        var lastPart = sections[sections.length - 1];
        if (lastPart === '' && sections.length > 1) {
            return sections[sections.length - 2];
        }
        if (ext.length > 0) {
            var lastPartExt = lastPart.substr(lastPart.length - ext.length);
            if (lastPartExt === ext) {
                return lastPart.substr(0, lastPart.length - ext.length);
            }
        }
        return lastPart;
    };
    path.extname = function (p) {
        p = path.normalize(p);
        var sections = p.split(path.sep);
        p = sections.pop();
        if (p === '' && sections.length > 0) {
            p = sections.pop();
        }
        if (p === '..') {
            return '';
        }
        var i = p.lastIndexOf('.');
        if (i === -1 || i === 0) {
            return '';
        }
        return p.substr(i);
    };
    path.isAbsolute = function (p) {
        return p.length > 0 && p.charAt(0) === path.sep;
    };
    path._makeLong = function (p) {
        return p;
    };
    path._removeDuplicateSeps = function (p) {
        p = p.replace(this._replaceRegex, this.sep);
        return p;
    };
    path.sep = '/';
    path._replaceRegex = new RegExp("//+", 'g');
    path.delimiter = ':';
    return path;
})();
module.exports = path;

},{"./node_process":25}],25:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var eventemitter = require('./node_eventemitter');
var path = null;
var TTY = (function (_super) {
    __extends(TTY, _super);
    function TTY() {
        _super.call(this, true, true);
        this.isRaw = false;
        this.columns = 80;
        this.rows = 120;
        this.isTTY = true;
    }
    TTY.prototype.setReadMode = function (mode) {
        if (this.isRaw !== mode) {
            this.isRaw = mode;
            this.emit('modeChange');
        }
    };
    TTY.prototype.changeColumns = function (columns) {
        if (columns !== this.columns) {
            this.columns = columns;
            this.emit('resize');
        }
    };
    TTY.prototype.changeRows = function (rows) {
        if (rows !== this.rows) {
            this.rows = rows;
            this.emit('resize');
        }
    };
    TTY.isatty = function (fd) {
        return fd instanceof TTY;
    };
    return TTY;
})(eventemitter.AbstractDuplexStream);
exports.TTY = TTY;
var Process = (function () {
    function Process() {
        this.startTime = Date.now();
        this._cwd = '/';
        this.platform = 'browser';
        this.argv = [];
        this.stdout = new TTY();
        this.stderr = new TTY();
        this.stdin = new TTY();
    }
    Process.prototype.chdir = function (dir) {
        if (path === null) {
            path = require('./node_path');
        }
        this._cwd = path.resolve(dir);
    };
    Process.prototype.cwd = function () {
        return this._cwd;
    };
    Process.prototype.uptime = function () {
        return ((Date.now() - this.startTime) / 1000) | 0;
    };
    return Process;
})();
exports.Process = Process;
exports.process = new Process();

},{"./node_eventemitter":21,"./node_path":24}],26:[function(require,module,exports){
function FindUtil(encoding) {
    encoding = (function () {
        switch (typeof encoding) {
            case 'object':
                return "" + encoding;
            case 'string':
                return encoding;
            default:
                throw new Error('Invalid encoding argument specified');
        }
    })();
    encoding = encoding.toLowerCase();
    switch (encoding) {
        case 'utf8':
        case 'utf-8':
            return UTF8;
        case 'ascii':
            return ASCII;
        case 'binary':
            return BINARY;
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            return UCS2;
        case 'hex':
            return HEX;
        case 'base64':
            return BASE64;
        case 'binary_string':
            return BINSTR;
        case 'binary_string_ie':
            return BINSTRIE;
        case 'extended_ascii':
            return ExtendedASCII;
        default:
            throw new Error("Unknown encoding: " + encoding);
    }
}
exports.FindUtil = FindUtil;
var UTF8 = (function () {
    function UTF8() {
    }
    UTF8.str2byte = function (str, buf) {
        var length = buf.length;
        var i = 0;
        var j = 0;
        var maxJ = length;
        var numChars = 0;
        while (i < str.length && j < maxJ) {
            var code = str.charCodeAt(i++);
            var next = str.charCodeAt(i);
            if (0xD800 <= code && code <= 0xDBFF && 0xDC00 <= next && next <= 0xDFFF) {
                if (j + 3 >= maxJ) {
                    break;
                }
                else {
                    numChars++;
                }
                var codePoint = (((code & 0x3FF) | 0x400) << 10) | (next & 0x3FF);
                buf.writeUInt8((codePoint >> 18) | 0xF0, j++);
                buf.writeUInt8(((codePoint >> 12) & 0x3F) | 0x80, j++);
                buf.writeUInt8(((codePoint >> 6) & 0x3F) | 0x80, j++);
                buf.writeUInt8((codePoint & 0x3F) | 0x80, j++);
                i++;
            }
            else if (code < 0x80) {
                buf.writeUInt8(code, j++);
                numChars++;
            }
            else if (code < 0x800) {
                if (j + 1 >= maxJ) {
                    break;
                }
                else {
                    numChars++;
                }
                buf.writeUInt8((code >> 6) | 0xC0, j++);
                buf.writeUInt8((code & 0x3F) | 0x80, j++);
            }
            else if (code < 0x10000) {
                if (j + 2 >= maxJ) {
                    break;
                }
                else {
                    numChars++;
                }
                buf.writeUInt8((code >> 12) | 0xE0, j++);
                buf.writeUInt8(((code >> 6) & 0x3F) | 0x80, j++);
                buf.writeUInt8((code & 0x3F) | 0x80, j++);
            }
        }
        return j;
    };
    UTF8.byte2str = function (buff) {
        var chars = [];
        var i = 0;
        while (i < buff.length) {
            var code = buff.readUInt8(i++);
            if (code < 0x80) {
                chars.push(String.fromCharCode(code));
            }
            else if (code < 0xC0) {
                throw new Error('Found incomplete part of character in string.');
            }
            else if (code < 0xE0) {
                chars.push(String.fromCharCode(((code & 0x1F) << 6) | (buff.readUInt8(i++) & 0x3F)));
            }
            else if (code < 0xF0) {
                chars.push(String.fromCharCode(((code & 0xF) << 12) | ((buff.readUInt8(i++) & 0x3F) << 6) | (buff.readUInt8(i++) & 0x3F)));
            }
            else if (code < 0xF8) {
                var byte3 = buff.readUInt8(i + 2);
                chars.push(String.fromCharCode(((((code & 0x7) << 8) | ((buff.readUInt8(i++) & 0x3F) << 2) | ((buff.readUInt8(i++) & 0x3F) >> 4)) & 0x3FF) | 0xD800));
                chars.push(String.fromCharCode((((byte3 & 0xF) << 6) | (buff.readUInt8(i++) & 0x3F)) | 0xDC00));
            }
            else {
                throw new Error('Unable to represent UTF-8 string as UTF-16 JavaScript string.');
            }
        }
        return chars.join('');
    };
    UTF8.byteLength = function (str) {
        var m = encodeURIComponent(str).match(/%[89ABab]/g);
        return str.length + (m ? m.length : 0);
    };
    return UTF8;
})();
exports.UTF8 = UTF8;
var ASCII = (function () {
    function ASCII() {
    }
    ASCII.str2byte = function (str, buf) {
        var length = str.length > buf.length ? buf.length : str.length;
        for (var i = 0; i < length; i++) {
            buf.writeUInt8(str.charCodeAt(i) % 256, i);
        }
        return length;
    };
    ASCII.byte2str = function (buff) {
        var chars = new Array(buff.length);
        for (var i = 0; i < buff.length; i++) {
            chars[i] = String.fromCharCode(buff.readUInt8(i) & 0x7F);
        }
        return chars.join('');
    };
    ASCII.byteLength = function (str) { return str.length; };
    return ASCII;
})();
exports.ASCII = ASCII;
var ExtendedASCII = (function () {
    function ExtendedASCII() {
    }
    ExtendedASCII.str2byte = function (str, buf) {
        var length = str.length > buf.length ? buf.length : str.length;
        for (var i = 0; i < length; i++) {
            var charCode = str.charCodeAt(i);
            if (charCode > 0x7F) {
                var charIdx = ExtendedASCII.extendedChars.indexOf(str.charAt(i));
                if (charIdx > -1) {
                    charCode = charIdx + 0x80;
                }
            }
            buf.writeUInt8(charCode, i);
        }
        return length;
    };
    ExtendedASCII.byte2str = function (buff) {
        var chars = new Array(buff.length);
        for (var i = 0; i < buff.length; i++) {
            var charCode = buff.readUInt8(i);
            if (charCode > 0x7F) {
                chars[i] = ExtendedASCII.extendedChars[charCode - 128];
            }
            else {
                chars[i] = String.fromCharCode(charCode);
            }
        }
        return chars.join('');
    };
    ExtendedASCII.byteLength = function (str) { return str.length; };
    ExtendedASCII.extendedChars = ['\u00C7', '\u00FC', '\u00E9', '\u00E2', '\u00E4',
        '\u00E0', '\u00E5', '\u00E7', '\u00EA', '\u00EB', '\u00E8', '\u00EF',
        '\u00EE', '\u00EC', '\u00C4', '\u00C5', '\u00C9', '\u00E6', '\u00C6',
        '\u00F4', '\u00F6', '\u00F2', '\u00FB', '\u00F9', '\u00FF', '\u00D6',
        '\u00DC', '\u00F8', '\u00A3', '\u00D8', '\u00D7', '\u0192', '\u00E1',
        '\u00ED', '\u00F3', '\u00FA', '\u00F1', '\u00D1', '\u00AA', '\u00BA',
        '\u00BF', '\u00AE', '\u00AC', '\u00BD', '\u00BC', '\u00A1', '\u00AB',
        '\u00BB', '_', '_', '_', '\u00A6', '\u00A6', '\u00C1', '\u00C2', '\u00C0',
        '\u00A9', '\u00A6', '\u00A6', '+', '+', '\u00A2', '\u00A5', '+', '+', '-',
        '-', '+', '-', '+', '\u00E3', '\u00C3', '+', '+', '-', '-', '\u00A6', '-',
        '+', '\u00A4', '\u00F0', '\u00D0', '\u00CA', '\u00CB', '\u00C8', 'i',
        '\u00CD', '\u00CE', '\u00CF', '+', '+', '_', '_', '\u00A6', '\u00CC', '_',
        '\u00D3', '\u00DF', '\u00D4', '\u00D2', '\u00F5', '\u00D5', '\u00B5',
        '\u00FE', '\u00DE', '\u00DA', '\u00DB', '\u00D9', '\u00FD', '\u00DD',
        '\u00AF', '\u00B4', '\u00AD', '\u00B1', '_', '\u00BE', '\u00B6', '\u00A7',
        '\u00F7', '\u00B8', '\u00B0', '\u00A8', '\u00B7', '\u00B9', '\u00B3',
        '\u00B2', '_', ' '];
    return ExtendedASCII;
})();
exports.ExtendedASCII = ExtendedASCII;
var BINARY = (function () {
    function BINARY() {
    }
    BINARY.str2byte = function (str, buf) {
        var length = str.length > buf.length ? buf.length : str.length;
        for (var i = 0; i < length; i++) {
            buf.writeUInt8(str.charCodeAt(i) & 0xFF, i);
        }
        return length;
    };
    BINARY.byte2str = function (buff) {
        var chars = new Array(buff.length);
        for (var i = 0; i < buff.length; i++) {
            chars[i] = String.fromCharCode(buff.readUInt8(i) & 0xFF);
        }
        return chars.join('');
    };
    BINARY.byteLength = function (str) { return str.length; };
    return BINARY;
})();
exports.BINARY = BINARY;
var BASE64 = (function () {
    function BASE64() {
    }
    BASE64.byte2str = function (buff) {
        var output = '';
        var i = 0;
        while (i < buff.length) {
            var chr1 = buff.readUInt8(i++);
            var chr2 = i < buff.length ? buff.readUInt8(i++) : NaN;
            var chr3 = i < buff.length ? buff.readUInt8(i++) : NaN;
            var enc1 = chr1 >> 2;
            var enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            var enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            var enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + BASE64.num2b64[enc1] + BASE64.num2b64[enc2] + BASE64.num2b64[enc3] + BASE64.num2b64[enc4];
        }
        return output;
    };
    BASE64.str2byte = function (str, buf) {
        var length = buf.length;
        var output = '';
        var i = 0;
        str = str.replace(/[^A-Za-z0-9\+\/\=\-\_]/g, '');
        var j = 0;
        while (i < str.length) {
            var enc1 = BASE64.b642num[str.charAt(i++)];
            var enc2 = BASE64.b642num[str.charAt(i++)];
            var enc3 = BASE64.b642num[str.charAt(i++)];
            var enc4 = BASE64.b642num[str.charAt(i++)];
            var chr1 = (enc1 << 2) | (enc2 >> 4);
            var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            var chr3 = ((enc3 & 3) << 6) | enc4;
            buf.writeUInt8(chr1, j++);
            if (j === length) {
                break;
            }
            if (enc3 !== 64) {
                output += buf.writeUInt8(chr2, j++);
            }
            if (j === length) {
                break;
            }
            if (enc4 !== 64) {
                output += buf.writeUInt8(chr3, j++);
            }
            if (j === length) {
                break;
            }
        }
        return j;
    };
    BASE64.byteLength = function (str) {
        return Math.floor(((str.replace(/[^A-Za-z0-9\+\/\-\_]/g, '')).length * 6) / 8);
    };
    BASE64.b64chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/', '='];
    BASE64.num2b64 = (function () {
        var obj = new Array(BASE64.b64chars.length);
        for (var idx = 0; idx < BASE64.b64chars.length; idx++) {
            var i = BASE64.b64chars[idx];
            obj[idx] = i;
        }
        return obj;
    })();
    BASE64.b642num = (function () {
        var obj = {};
        for (var idx = 0; idx < BASE64.b64chars.length; idx++) {
            var i = BASE64.b64chars[idx];
            obj[i] = idx;
        }
        obj['-'] = 62;
        obj['_'] = 63;
        return obj;
    })();
    return BASE64;
})();
exports.BASE64 = BASE64;
var UCS2 = (function () {
    function UCS2() {
    }
    UCS2.str2byte = function (str, buf) {
        var len = str.length;
        if (len * 2 > buf.length) {
            len = buf.length % 2 === 1 ? (buf.length - 1) / 2 : buf.length / 2;
        }
        for (var i = 0; i < len; i++) {
            buf.writeUInt16LE(str.charCodeAt(i), i * 2);
        }
        return len * 2;
    };
    UCS2.byte2str = function (buff) {
        if (buff.length % 2 !== 0) {
            throw new Error('Invalid UCS2 byte array.');
        }
        var chars = new Array(buff.length / 2);
        for (var i = 0; i < buff.length; i += 2) {
            chars[i / 2] = String.fromCharCode(buff.readUInt8(i) | (buff.readUInt8(i + 1) << 8));
        }
        return chars.join('');
    };
    UCS2.byteLength = function (str) {
        return str.length * 2;
    };
    return UCS2;
})();
exports.UCS2 = UCS2;
var HEX = (function () {
    function HEX() {
    }
    HEX.str2byte = function (str, buf) {
        if (str.length % 2 === 1) {
            throw new Error('Invalid hex string');
        }
        var numBytes = str.length >> 1;
        if (numBytes > buf.length) {
            numBytes = buf.length;
        }
        for (var i = 0; i < numBytes; i++) {
            var char1 = this.hex2num[str.charAt(i << 1)];
            var char2 = this.hex2num[str.charAt((i << 1) + 1)];
            buf.writeUInt8((char1 << 4) | char2, i);
        }
        return numBytes;
    };
    HEX.byte2str = function (buff) {
        var len = buff.length;
        var chars = new Array(len << 1);
        var j = 0;
        for (var i = 0; i < len; i++) {
            var hex2 = buff.readUInt8(i) & 0xF;
            var hex1 = buff.readUInt8(i) >> 4;
            chars[j++] = this.num2hex[hex1];
            chars[j++] = this.num2hex[hex2];
        }
        return chars.join('');
    };
    HEX.byteLength = function (str) {
        return str.length >> 1;
    };
    HEX.HEXCHARS = '0123456789abcdef';
    HEX.num2hex = (function () {
        var obj = new Array(HEX.HEXCHARS.length);
        for (var idx = 0; idx < HEX.HEXCHARS.length; idx++) {
            var i = HEX.HEXCHARS[idx];
            obj[idx] = i;
        }
        return obj;
    })();
    HEX.hex2num = (function () {
        var idx, i;
        var obj = {};
        for (idx = 0; idx < HEX.HEXCHARS.length; idx++) {
            i = HEX.HEXCHARS[idx];
            obj[i] = idx;
        }
        var capitals = 'ABCDEF';
        for (idx = 0; idx < capitals.length; idx++) {
            i = capitals[idx];
            obj[i] = idx + 10;
        }
        return obj;
    })();
    return HEX;
})();
exports.HEX = HEX;
var BINSTR = (function () {
    function BINSTR() {
    }
    BINSTR.str2byte = function (str, buf) {
        if (str.length === 0) {
            return 0;
        }
        var numBytes = BINSTR.byteLength(str);
        if (numBytes > buf.length) {
            numBytes = buf.length;
        }
        var j = 0;
        var startByte = 0;
        var endByte = startByte + numBytes;
        var firstChar = str.charCodeAt(j++);
        if (firstChar !== 0) {
            buf.writeUInt8(firstChar & 0xFF, 0);
            startByte = 1;
        }
        for (var i = startByte; i < endByte; i += 2) {
            var chr = str.charCodeAt(j++);
            if (endByte - i === 1) {
                buf.writeUInt8(chr >> 8, i);
            }
            if (endByte - i >= 2) {
                buf.writeUInt16BE(chr, i);
            }
        }
        return numBytes;
    };
    BINSTR.byte2str = function (buff) {
        var len = buff.length;
        if (len === 0) {
            return '';
        }
        var chars = new Array((len >> 1) + 1);
        var j = 0;
        for (var i = 0; i < chars.length; i++) {
            if (i === 0) {
                if (len % 2 === 1) {
                    chars[i] = String.fromCharCode((1 << 8) | buff.readUInt8(j++));
                }
                else {
                    chars[i] = String.fromCharCode(0);
                }
            }
            else {
                chars[i] = String.fromCharCode((buff.readUInt8(j++) << 8) | buff.readUInt8(j++));
            }
        }
        return chars.join('');
    };
    BINSTR.byteLength = function (str) {
        if (str.length === 0) {
            return 0;
        }
        var firstChar = str.charCodeAt(0);
        var bytelen = (str.length - 1) << 1;
        if (firstChar !== 0) {
            bytelen++;
        }
        return bytelen;
    };
    return BINSTR;
})();
exports.BINSTR = BINSTR;
var BINSTRIE = (function () {
    function BINSTRIE() {
    }
    BINSTRIE.str2byte = function (str, buf) {
        var length = str.length > buf.length ? buf.length : str.length;
        for (var i = 0; i < length; i++) {
            buf.writeUInt8(str.charCodeAt(i) - 0x20, i);
        }
        return length;
    };
    BINSTRIE.byte2str = function (buff) {
        var chars = new Array(buff.length);
        for (var i = 0; i < buff.length; i++) {
            chars[i] = String.fromCharCode(buff.readUInt8(i) + 0x20);
        }
        return chars.join('');
    };
    BINSTRIE.byteLength = function (str) {
        return str.length;
    };
    return BINSTRIE;
})();
exports.BINSTRIE = BINSTRIE;

},{}],27:[function(require,module,exports){
/**
 * Grab bag of utility functions used across the code.
 */
exports.isIE = typeof navigator !== "undefined" && (/(msie) ([\w.]+)/.exec(navigator.userAgent.toLowerCase()) != null || navigator.userAgent.indexOf('Trident') !== -1);
exports.isWebWorker = typeof window === "undefined";

},{}],28:[function(require,module,exports){
var node_fs_stats = require('../core/node_fs_stats');
var path = require('../core/node_path');
var Stats = node_fs_stats.Stats;
var FileIndex = (function () {
    function FileIndex() {
        this._index = {};
        this.addPath('/', new DirInode());
    }
    FileIndex.prototype._split_path = function (p) {
        var dirpath = path.dirname(p);
        var itemname = p.substr(dirpath.length + (dirpath === "/" ? 0 : 1));
        return [dirpath, itemname];
    };
    FileIndex.prototype.fileIterator = function (cb) {
        for (var path in this._index) {
            var dir = this._index[path];
            var files = dir.getListing();
            for (var i = 0; i < files.length; i++) {
                var item = dir.getItem(files[i]);
                if (item.isFile()) {
                    cb(item.getData());
                }
            }
        }
    };
    FileIndex.prototype.addPath = function (path, inode) {
        if (inode == null) {
            throw new Error('Inode must be specified');
        }
        if (path[0] !== '/') {
            throw new Error('Path must be absolute, got: ' + path);
        }
        if (this._index.hasOwnProperty(path)) {
            return this._index[path] === inode;
        }
        var splitPath = this._split_path(path);
        var dirpath = splitPath[0];
        var itemname = splitPath[1];
        var parent = this._index[dirpath];
        if (parent === undefined && path !== '/') {
            parent = new DirInode();
            if (!this.addPath(dirpath, parent)) {
                return false;
            }
        }
        if (path !== '/') {
            if (!parent.addItem(itemname, inode)) {
                return false;
            }
        }
        if (!inode.isFile()) {
            this._index[path] = inode;
        }
        return true;
    };
    FileIndex.prototype.removePath = function (path) {
        var splitPath = this._split_path(path);
        var dirpath = splitPath[0];
        var itemname = splitPath[1];
        var parent = this._index[dirpath];
        if (parent === undefined) {
            return null;
        }
        var inode = parent.remItem(itemname);
        if (inode === null) {
            return null;
        }
        if (!inode.isFile()) {
            var dirInode = inode;
            var children = dirInode.getListing();
            for (var i = 0; i < children.length; i++) {
                this.removePath(path + '/' + children[i]);
            }
            if (path !== '/') {
                delete this._index[path];
            }
        }
        return inode;
    };
    FileIndex.prototype.ls = function (path) {
        var item = this._index[path];
        if (item === undefined) {
            return null;
        }
        return item.getListing();
    };
    FileIndex.prototype.getInode = function (path) {
        var splitPath = this._split_path(path);
        var dirpath = splitPath[0];
        var itemname = splitPath[1];
        var parent = this._index[dirpath];
        if (parent === undefined) {
            return null;
        }
        if (dirpath === path) {
            return parent;
        }
        return parent.getItem(itemname);
    };
    FileIndex.from_listing = function (listing) {
        var idx = new FileIndex();
        var rootInode = new DirInode();
        idx._index['/'] = rootInode;
        var queue = [['', listing, rootInode]];
        while (queue.length > 0) {
            var inode;
            var next = queue.pop();
            var pwd = next[0];
            var tree = next[1];
            var parent = next[2];
            for (var node in tree) {
                var children = tree[node];
                var name = "" + pwd + "/" + node;
                if (children != null) {
                    idx._index[name] = inode = new DirInode();
                    queue.push([name, children, inode]);
                }
                else {
                    inode = new FileInode(new Stats(node_fs_stats.FileType.FILE, -1, 0x16D));
                }
                if (parent != null) {
                    parent._ls[node] = inode;
                }
            }
        }
        return idx;
    };
    return FileIndex;
})();
exports.FileIndex = FileIndex;
var FileInode = (function () {
    function FileInode(data) {
        this.data = data;
    }
    FileInode.prototype.isFile = function () { return true; };
    FileInode.prototype.isDir = function () { return false; };
    FileInode.prototype.getData = function () { return this.data; };
    FileInode.prototype.setData = function (data) { this.data = data; };
    return FileInode;
})();
exports.FileInode = FileInode;
var DirInode = (function () {
    function DirInode() {
        this._ls = {};
    }
    DirInode.prototype.isFile = function () {
        return false;
    };
    DirInode.prototype.isDir = function () {
        return true;
    };
    DirInode.prototype.getStats = function () {
        return new Stats(node_fs_stats.FileType.DIRECTORY, 4096, 0x16D);
    };
    DirInode.prototype.getListing = function () {
        return Object.keys(this._ls);
    };
    DirInode.prototype.getItem = function (p) {
        var _ref;
        return (_ref = this._ls[p]) != null ? _ref : null;
    };
    DirInode.prototype.addItem = function (p, inode) {
        if (p in this._ls) {
            return false;
        }
        this._ls[p] = inode;
        return true;
    };
    DirInode.prototype.remItem = function (p) {
        var item = this._ls[p];
        if (item === undefined) {
            return null;
        }
        delete this._ls[p];
        return item;
    };
    return DirInode;
})();
exports.DirInode = DirInode;

},{"../core/node_fs_stats":23,"../core/node_path":24}],29:[function(require,module,exports){
var node_fs_stats = require('../core/node_fs_stats');
var buffer = require('../core/buffer');
var Inode = (function () {
    function Inode(id, size, mode, atime, mtime, ctime) {
        this.id = id;
        this.size = size;
        this.mode = mode;
        this.atime = atime;
        this.mtime = mtime;
        this.ctime = ctime;
    }
    Inode.prototype.toStats = function () {
        return new node_fs_stats.Stats((this.mode & 0xF000) === node_fs_stats.FileType.DIRECTORY ? node_fs_stats.FileType.DIRECTORY : node_fs_stats.FileType.FILE, this.size, this.mode, new Date(this.atime), new Date(this.mtime), new Date(this.ctime));
    };
    Inode.prototype.getSize = function () {
        return 30 + this.id.length;
    };
    Inode.prototype.toBuffer = function (buff) {
        if (buff === void 0) { buff = new buffer.Buffer(this.getSize()); }
        buff.writeUInt32LE(this.size, 0);
        buff.writeUInt16LE(this.mode, 4);
        buff.writeDoubleLE(this.atime, 6);
        buff.writeDoubleLE(this.mtime, 14);
        buff.writeDoubleLE(this.ctime, 22);
        buff.write(this.id, 30, this.id.length, 'ascii');
        return buff;
    };
    Inode.prototype.update = function (stats) {
        var hasChanged = false;
        if (this.size !== stats.size) {
            this.size = stats.size;
            hasChanged = true;
        }
        if (this.mode !== stats.mode) {
            this.mode = stats.mode;
            hasChanged = true;
        }
        var atimeMs = stats.atime.getTime();
        if (this.atime !== atimeMs) {
            this.atime = atimeMs;
            hasChanged = true;
        }
        var mtimeMs = stats.mtime.getTime();
        if (this.mtime !== mtimeMs) {
            this.mtime = mtimeMs;
            hasChanged = true;
        }
        var ctimeMs = stats.ctime.getTime();
        if (this.ctime !== ctimeMs) {
            this.ctime = ctimeMs;
            hasChanged = true;
        }
        return hasChanged;
    };
    Inode.fromBuffer = function (buffer) {
        if (buffer === undefined) {
            throw new Error("NO");
        }
        return new Inode(buffer.toString('ascii', 30), buffer.readUInt32LE(0), buffer.readUInt16LE(4), buffer.readDoubleLE(6), buffer.readDoubleLE(14), buffer.readDoubleLE(22));
    };
    Inode.prototype.isFile = function () {
        return (this.mode & 0xF000) === node_fs_stats.FileType.FILE;
    };
    Inode.prototype.isDirectory = function () {
        return (this.mode & 0xF000) === node_fs_stats.FileType.DIRECTORY;
    };
    return Inode;
})();
module.exports = Inode;

},{"../core/buffer":13,"../core/node_fs_stats":23}],30:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var file_system = require('../core/file_system');
var api_error = require('../core/api_error');
var node_fs_stats = require('../core/node_fs_stats');
var path = require('../core/node_path');
var Inode = require('../generic/inode');
var buffer = require('../core/buffer');
var preload_file = require('../generic/preload_file');
var ROOT_NODE_ID = "/", ApiError = api_error.ApiError, Buffer = buffer.Buffer;
function GenerateRandomID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function noError(e, cb) {
    if (e) {
        cb(e);
        return false;
    }
    return true;
}
function noErrorTx(e, tx, cb) {
    if (e) {
        tx.abort(function () {
            cb(e);
        });
        return false;
    }
    return true;
}
var SimpleSyncRWTransaction = (function () {
    function SimpleSyncRWTransaction(store) {
        this.store = store;
        this.originalData = {};
        this.modifiedKeys = [];
    }
    SimpleSyncRWTransaction.prototype.stashOldValue = function (key, value) {
        if (!this.originalData.hasOwnProperty(key)) {
            this.originalData[key] = value;
        }
    };
    SimpleSyncRWTransaction.prototype.markModified = function (key) {
        if (this.modifiedKeys.indexOf(key) === -1) {
            this.modifiedKeys.push(key);
            if (!this.originalData.hasOwnProperty(key)) {
                this.originalData[key] = this.store.get(key);
            }
        }
    };
    SimpleSyncRWTransaction.prototype.get = function (key) {
        var val = this.store.get(key);
        this.stashOldValue(key, val);
        return val;
    };
    SimpleSyncRWTransaction.prototype.put = function (key, data, overwrite) {
        this.markModified(key);
        return this.store.put(key, data, overwrite);
    };
    SimpleSyncRWTransaction.prototype.delete = function (key) {
        this.markModified(key);
        this.store.delete(key);
    };
    SimpleSyncRWTransaction.prototype.commit = function () { };
    SimpleSyncRWTransaction.prototype.abort = function () {
        var i, key, value;
        for (i = 0; i < this.modifiedKeys.length; i++) {
            key = this.modifiedKeys[i];
            value = this.originalData[key];
            if (value === null) {
                this.store.delete(key);
            }
            else {
                this.store.put(key, value, true);
            }
        }
    };
    return SimpleSyncRWTransaction;
})();
exports.SimpleSyncRWTransaction = SimpleSyncRWTransaction;
var SyncKeyValueFile = (function (_super) {
    __extends(SyncKeyValueFile, _super);
    function SyncKeyValueFile(_fs, _path, _flag, _stat, contents) {
        _super.call(this, _fs, _path, _flag, _stat, contents);
    }
    SyncKeyValueFile.prototype.syncSync = function () {
        if (this.isDirty()) {
            this._fs._syncSync(this.getPath(), this.getBuffer(), this.getStats());
            this.resetDirty();
        }
    };
    SyncKeyValueFile.prototype.closeSync = function () {
        this.syncSync();
    };
    return SyncKeyValueFile;
})(preload_file.PreloadFile);
exports.SyncKeyValueFile = SyncKeyValueFile;
var SyncKeyValueFileSystem = (function (_super) {
    __extends(SyncKeyValueFileSystem, _super);
    function SyncKeyValueFileSystem(options) {
        _super.call(this);
        this.store = options.store;
        this.makeRootDirectory();
    }
    SyncKeyValueFileSystem.isAvailable = function () { return true; };
    SyncKeyValueFileSystem.prototype.getName = function () { return this.store.name(); };
    SyncKeyValueFileSystem.prototype.isReadOnly = function () { return false; };
    SyncKeyValueFileSystem.prototype.supportsSymlinks = function () { return false; };
    SyncKeyValueFileSystem.prototype.supportsProps = function () { return false; };
    SyncKeyValueFileSystem.prototype.supportsSynch = function () { return true; };
    SyncKeyValueFileSystem.prototype.makeRootDirectory = function () {
        var tx = this.store.beginTransaction('readwrite');
        if (tx.get(ROOT_NODE_ID) === undefined) {
            var currTime = (new Date()).getTime(), dirInode = new Inode(GenerateRandomID(), 4096, 511 | node_fs_stats.FileType.DIRECTORY, currTime, currTime, currTime);
            tx.put(dirInode.id, new Buffer("{}"), false);
            tx.put(ROOT_NODE_ID, dirInode.toBuffer(), false);
            tx.commit();
        }
    };
    SyncKeyValueFileSystem.prototype._findINode = function (tx, parent, filename) {
        var _this = this;
        var read_directory = function (inode) {
            var dirList = _this.getDirListing(tx, parent, inode);
            if (dirList[filename]) {
                return dirList[filename];
            }
            else {
                throw ApiError.ENOENT(path.resolve(parent, filename));
            }
        };
        if (parent === '/') {
            if (filename === '') {
                return ROOT_NODE_ID;
            }
            else {
                return read_directory(this.getINode(tx, parent, ROOT_NODE_ID));
            }
        }
        else {
            return read_directory(this.getINode(tx, parent + path.sep + filename, this._findINode(tx, path.dirname(parent), path.basename(parent))));
        }
    };
    SyncKeyValueFileSystem.prototype.findINode = function (tx, p) {
        return this.getINode(tx, p, this._findINode(tx, path.dirname(p), path.basename(p)));
    };
    SyncKeyValueFileSystem.prototype.getINode = function (tx, p, id) {
        var inode = tx.get(id);
        if (inode === undefined) {
            throw ApiError.ENOENT(p);
        }
        return Inode.fromBuffer(inode);
    };
    SyncKeyValueFileSystem.prototype.getDirListing = function (tx, p, inode) {
        if (!inode.isDirectory()) {
            throw ApiError.ENOTDIR(p);
        }
        var data = tx.get(inode.id);
        if (data === undefined) {
            throw ApiError.ENOENT(p);
        }
        return JSON.parse(data.toString());
    };
    SyncKeyValueFileSystem.prototype.addNewNode = function (tx, data) {
        var retries = 0, currId;
        while (retries < 5) {
            try {
                currId = GenerateRandomID();
                tx.put(currId, data, false);
                return currId;
            }
            catch (e) {
            }
        }
        throw new ApiError(api_error.ErrorCode.EIO, 'Unable to commit data to key-value store.');
    };
    SyncKeyValueFileSystem.prototype.commitNewFile = function (tx, p, type, mode, data) {
        var parentDir = path.dirname(p), fname = path.basename(p), parentNode = this.findINode(tx, parentDir), dirListing = this.getDirListing(tx, parentDir, parentNode), currTime = (new Date()).getTime();
        if (p === '/') {
            throw ApiError.EEXIST(p);
        }
        if (dirListing[fname]) {
            throw ApiError.EEXIST(p);
        }
        try {
            var dataId = this.addNewNode(tx, data), fileNode = new Inode(dataId, data.length, mode | type, currTime, currTime, currTime), fileNodeId = this.addNewNode(tx, fileNode.toBuffer());
            dirListing[fname] = fileNodeId;
            tx.put(parentNode.id, new Buffer(JSON.stringify(dirListing)), true);
        }
        catch (e) {
            tx.abort();
            throw e;
        }
        tx.commit();
        return fileNode;
    };
    SyncKeyValueFileSystem.prototype.empty = function () {
        this.store.clear();
        this.makeRootDirectory();
    };
    SyncKeyValueFileSystem.prototype.renameSync = function (oldPath, newPath) {
        var tx = this.store.beginTransaction('readwrite'), oldParent = path.dirname(oldPath), oldName = path.basename(oldPath), newParent = path.dirname(newPath), newName = path.basename(newPath), oldDirNode = this.findINode(tx, oldParent), oldDirList = this.getDirListing(tx, oldParent, oldDirNode);
        if (!oldDirList[oldName]) {
            throw ApiError.ENOENT(oldPath);
        }
        var nodeId = oldDirList[oldName];
        delete oldDirList[oldName];
        if ((newParent + '/').indexOf(oldPath + '/') === 0) {
            throw new ApiError(api_error.ErrorCode.EBUSY, oldParent);
        }
        var newDirNode, newDirList;
        if (newParent === oldParent) {
            newDirNode = oldDirNode;
            newDirList = oldDirList;
        }
        else {
            newDirNode = this.findINode(tx, newParent);
            newDirList = this.getDirListing(tx, newParent, newDirNode);
        }
        if (newDirList[newName]) {
            var newNameNode = this.getINode(tx, newPath, newDirList[newName]);
            if (newNameNode.isFile()) {
                try {
                    tx.delete(newNameNode.id);
                    tx.delete(newDirList[newName]);
                }
                catch (e) {
                    tx.abort();
                    throw e;
                }
            }
            else {
                throw ApiError.EPERM(newPath);
            }
        }
        newDirList[newName] = nodeId;
        try {
            tx.put(oldDirNode.id, new Buffer(JSON.stringify(oldDirList)), true);
            tx.put(newDirNode.id, new Buffer(JSON.stringify(newDirList)), true);
        }
        catch (e) {
            tx.abort();
            throw e;
        }
        tx.commit();
    };
    SyncKeyValueFileSystem.prototype.statSync = function (p, isLstat) {
        return this.findINode(this.store.beginTransaction('readonly'), p).toStats();
    };
    SyncKeyValueFileSystem.prototype.createFileSync = function (p, flag, mode) {
        var tx = this.store.beginTransaction('readwrite'), data = new Buffer(0), newFile = this.commitNewFile(tx, p, node_fs_stats.FileType.FILE, mode, data);
        return new SyncKeyValueFile(this, p, flag, newFile.toStats(), data);
    };
    SyncKeyValueFileSystem.prototype.openFileSync = function (p, flag) {
        var tx = this.store.beginTransaction('readonly'), node = this.findINode(tx, p), data = tx.get(node.id);
        if (data === undefined) {
            throw ApiError.ENOENT(p);
        }
        return new SyncKeyValueFile(this, p, flag, node.toStats(), data);
    };
    SyncKeyValueFileSystem.prototype.removeEntry = function (p, isDir) {
        var tx = this.store.beginTransaction('readwrite'), parent = path.dirname(p), parentNode = this.findINode(tx, parent), parentListing = this.getDirListing(tx, parent, parentNode), fileName = path.basename(p);
        if (!parentListing[fileName]) {
            throw ApiError.ENOENT(p);
        }
        var fileNodeId = parentListing[fileName];
        delete parentListing[fileName];
        var fileNode = this.getINode(tx, p, fileNodeId);
        if (!isDir && fileNode.isDirectory()) {
            throw ApiError.EISDIR(p);
        }
        else if (isDir && !fileNode.isDirectory()) {
            throw ApiError.ENOTDIR(p);
        }
        try {
            tx.delete(fileNode.id);
            tx.delete(fileNodeId);
            tx.put(parentNode.id, new Buffer(JSON.stringify(parentListing)), true);
        }
        catch (e) {
            tx.abort();
            throw e;
        }
        tx.commit();
    };
    SyncKeyValueFileSystem.prototype.unlinkSync = function (p) {
        this.removeEntry(p, false);
    };
    SyncKeyValueFileSystem.prototype.rmdirSync = function (p) {
        this.removeEntry(p, true);
    };
    SyncKeyValueFileSystem.prototype.mkdirSync = function (p, mode) {
        var tx = this.store.beginTransaction('readwrite'), data = new Buffer('{}');
        this.commitNewFile(tx, p, node_fs_stats.FileType.DIRECTORY, mode, data);
    };
    SyncKeyValueFileSystem.prototype.readdirSync = function (p) {
        var tx = this.store.beginTransaction('readonly');
        return Object.keys(this.getDirListing(tx, p, this.findINode(tx, p)));
    };
    SyncKeyValueFileSystem.prototype._syncSync = function (p, data, stats) {
        var tx = this.store.beginTransaction('readwrite'), fileInodeId = this._findINode(tx, path.dirname(p), path.basename(p)), fileInode = this.getINode(tx, p, fileInodeId), inodeChanged = fileInode.update(stats);
        try {
            tx.put(fileInode.id, data, true);
            if (inodeChanged) {
                tx.put(fileInodeId, fileInode.toBuffer(), true);
            }
        }
        catch (e) {
            tx.abort();
            throw e;
        }
        tx.commit();
    };
    return SyncKeyValueFileSystem;
})(file_system.SynchronousFileSystem);
exports.SyncKeyValueFileSystem = SyncKeyValueFileSystem;
var AsyncKeyValueFile = (function (_super) {
    __extends(AsyncKeyValueFile, _super);
    function AsyncKeyValueFile(_fs, _path, _flag, _stat, contents) {
        _super.call(this, _fs, _path, _flag, _stat, contents);
    }
    AsyncKeyValueFile.prototype.sync = function (cb) {
        var _this = this;
        if (this.isDirty()) {
            this._fs._sync(this.getPath(), this.getBuffer(), this.getStats(), function (e) {
                if (!e) {
                    _this.resetDirty();
                }
                cb(e);
            });
        }
        else {
            cb();
        }
    };
    AsyncKeyValueFile.prototype.close = function (cb) {
        this.sync(cb);
    };
    return AsyncKeyValueFile;
})(preload_file.PreloadFile);
exports.AsyncKeyValueFile = AsyncKeyValueFile;
var AsyncKeyValueFileSystem = (function (_super) {
    __extends(AsyncKeyValueFileSystem, _super);
    function AsyncKeyValueFileSystem() {
        _super.apply(this, arguments);
    }
    AsyncKeyValueFileSystem.prototype.init = function (store, cb) {
        this.store = store;
        this.makeRootDirectory(cb);
    };
    AsyncKeyValueFileSystem.isAvailable = function () { return true; };
    AsyncKeyValueFileSystem.prototype.getName = function () { return this.store.name(); };
    AsyncKeyValueFileSystem.prototype.isReadOnly = function () { return false; };
    AsyncKeyValueFileSystem.prototype.supportsSymlinks = function () { return false; };
    AsyncKeyValueFileSystem.prototype.supportsProps = function () { return false; };
    AsyncKeyValueFileSystem.prototype.supportsSynch = function () { return false; };
    AsyncKeyValueFileSystem.prototype.makeRootDirectory = function (cb) {
        var tx = this.store.beginTransaction('readwrite');
        tx.get(ROOT_NODE_ID, function (e, data) {
            if (e || data === undefined) {
                var currTime = (new Date()).getTime(), dirInode = new Inode(GenerateRandomID(), 4096, 511 | node_fs_stats.FileType.DIRECTORY, currTime, currTime, currTime);
                tx.put(dirInode.id, new Buffer("{}"), false, function (e) {
                    if (noErrorTx(e, tx, cb)) {
                        tx.put(ROOT_NODE_ID, dirInode.toBuffer(), false, function (e) {
                            if (e) {
                                tx.abort(function () { cb(e); });
                            }
                            else {
                                tx.commit(cb);
                            }
                        });
                    }
                });
            }
            else {
                tx.commit(cb);
            }
        });
    };
    AsyncKeyValueFileSystem.prototype._findINode = function (tx, parent, filename, cb) {
        var _this = this;
        var handle_directory_listings = function (e, inode, dirList) {
            if (e) {
                cb(e);
            }
            else if (dirList[filename]) {
                cb(null, dirList[filename]);
            }
            else {
                cb(ApiError.ENOENT(path.resolve(parent, filename)));
            }
        };
        if (parent === '/') {
            if (filename === '') {
                cb(null, ROOT_NODE_ID);
            }
            else {
                this.getINode(tx, parent, ROOT_NODE_ID, function (e, inode) {
                    if (noError(e, cb)) {
                        _this.getDirListing(tx, parent, inode, function (e, dirList) {
                            handle_directory_listings(e, inode, dirList);
                        });
                    }
                });
            }
        }
        else {
            this.findINodeAndDirListing(tx, parent, handle_directory_listings);
        }
    };
    AsyncKeyValueFileSystem.prototype.findINode = function (tx, p, cb) {
        var _this = this;
        this._findINode(tx, path.dirname(p), path.basename(p), function (e, id) {
            if (noError(e, cb)) {
                _this.getINode(tx, p, id, cb);
            }
        });
    };
    AsyncKeyValueFileSystem.prototype.getINode = function (tx, p, id, cb) {
        tx.get(id, function (e, data) {
            if (noError(e, cb)) {
                if (data === undefined) {
                    cb(ApiError.ENOENT(p));
                }
                else {
                    cb(null, Inode.fromBuffer(data));
                }
            }
        });
    };
    AsyncKeyValueFileSystem.prototype.getDirListing = function (tx, p, inode, cb) {
        if (!inode.isDirectory()) {
            cb(ApiError.ENOTDIR(p));
        }
        else {
            tx.get(inode.id, function (e, data) {
                if (noError(e, cb)) {
                    try {
                        cb(null, JSON.parse(data.toString()));
                    }
                    catch (e) {
                        cb(ApiError.ENOENT(p));
                    }
                }
            });
        }
    };
    AsyncKeyValueFileSystem.prototype.findINodeAndDirListing = function (tx, p, cb) {
        var _this = this;
        this.findINode(tx, p, function (e, inode) {
            if (noError(e, cb)) {
                _this.getDirListing(tx, p, inode, function (e, listing) {
                    if (noError(e, cb)) {
                        cb(null, inode, listing);
                    }
                });
            }
        });
    };
    AsyncKeyValueFileSystem.prototype.addNewNode = function (tx, data, cb) {
        var retries = 0, currId, reroll = function () {
            if (++retries === 5) {
                cb(new ApiError(api_error.ErrorCode.EIO, 'Unable to commit data to key-value store.'));
            }
            else {
                currId = GenerateRandomID();
                tx.put(currId, data, false, function (e, committed) {
                    if (e || !committed) {
                        reroll();
                    }
                    else {
                        cb(null, currId);
                    }
                });
            }
        };
        reroll();
    };
    AsyncKeyValueFileSystem.prototype.commitNewFile = function (tx, p, type, mode, data, cb) {
        var _this = this;
        var parentDir = path.dirname(p), fname = path.basename(p), currTime = (new Date()).getTime();
        if (p === '/') {
            return cb(ApiError.EEXIST(p));
        }
        this.findINodeAndDirListing(tx, parentDir, function (e, parentNode, dirListing) {
            if (noErrorTx(e, tx, cb)) {
                if (dirListing[fname]) {
                    tx.abort(function () {
                        cb(ApiError.EEXIST(p));
                    });
                }
                else {
                    _this.addNewNode(tx, data, function (e, dataId) {
                        if (noErrorTx(e, tx, cb)) {
                            var fileInode = new Inode(dataId, data.length, mode | type, currTime, currTime, currTime);
                            _this.addNewNode(tx, fileInode.toBuffer(), function (e, fileInodeId) {
                                if (noErrorTx(e, tx, cb)) {
                                    dirListing[fname] = fileInodeId;
                                    tx.put(parentNode.id, new Buffer(JSON.stringify(dirListing)), true, function (e) {
                                        if (noErrorTx(e, tx, cb)) {
                                            tx.commit(function (e) {
                                                if (noErrorTx(e, tx, cb)) {
                                                    cb(null, fileInode);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    };
    AsyncKeyValueFileSystem.prototype.empty = function (cb) {
        var _this = this;
        this.store.clear(function (e) {
            if (noError(e, cb)) {
                _this.makeRootDirectory(cb);
            }
        });
    };
    AsyncKeyValueFileSystem.prototype.rename = function (oldPath, newPath, cb) {
        var _this = this;
        var tx = this.store.beginTransaction('readwrite'), oldParent = path.dirname(oldPath), oldName = path.basename(oldPath), newParent = path.dirname(newPath), newName = path.basename(newPath), inodes = {}, lists = {}, errorOccurred = false;
        if ((newParent + '/').indexOf(oldPath + '/') === 0) {
            return cb(new ApiError(api_error.ErrorCode.EBUSY, oldParent));
        }
        var theOleSwitcharoo = function () {
            if (errorOccurred || !lists.hasOwnProperty(oldParent) || !lists.hasOwnProperty(newParent)) {
                return;
            }
            var oldParentList = lists[oldParent], oldParentINode = inodes[oldParent], newParentList = lists[newParent], newParentINode = inodes[newParent];
            if (!oldParentList[oldName]) {
                cb(ApiError.ENOENT(oldPath));
            }
            else {
                var fileId = oldParentList[oldName];
                delete oldParentList[oldName];
                var completeRename = function () {
                    newParentList[newName] = fileId;
                    tx.put(oldParentINode.id, new Buffer(JSON.stringify(oldParentList)), true, function (e) {
                        if (noErrorTx(e, tx, cb)) {
                            if (oldParent === newParent) {
                                tx.commit(cb);
                            }
                            else {
                                tx.put(newParentINode.id, new Buffer(JSON.stringify(newParentList)), true, function (e) {
                                    if (noErrorTx(e, tx, cb)) {
                                        tx.commit(cb);
                                    }
                                });
                            }
                        }
                    });
                };
                if (newParentList[newName]) {
                    _this.getINode(tx, newPath, newParentList[newName], function (e, inode) {
                        if (noErrorTx(e, tx, cb)) {
                            if (inode.isFile()) {
                                tx.delete(inode.id, function (e) {
                                    if (noErrorTx(e, tx, cb)) {
                                        tx.delete(newParentList[newName], function (e) {
                                            if (noErrorTx(e, tx, cb)) {
                                                completeRename();
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                tx.abort(function (e) {
                                    cb(ApiError.EPERM(newPath));
                                });
                            }
                        }
                    });
                }
                else {
                    completeRename();
                }
            }
        };
        var processInodeAndListings = function (p) {
            _this.findINodeAndDirListing(tx, p, function (e, node, dirList) {
                if (e) {
                    if (!errorOccurred) {
                        errorOccurred = true;
                        tx.abort(function () {
                            cb(e);
                        });
                    }
                }
                else {
                    inodes[p] = node;
                    lists[p] = dirList;
                    theOleSwitcharoo();
                }
            });
        };
        processInodeAndListings(oldParent);
        if (oldParent !== newParent) {
            processInodeAndListings(newParent);
        }
    };
    AsyncKeyValueFileSystem.prototype.stat = function (p, isLstat, cb) {
        var tx = this.store.beginTransaction('readonly');
        this.findINode(tx, p, function (e, inode) {
            if (noError(e, cb)) {
                cb(null, inode.toStats());
            }
        });
    };
    AsyncKeyValueFileSystem.prototype.createFile = function (p, flag, mode, cb) {
        var _this = this;
        var tx = this.store.beginTransaction('readwrite'), data = new Buffer(0);
        this.commitNewFile(tx, p, node_fs_stats.FileType.FILE, mode, data, function (e, newFile) {
            if (noError(e, cb)) {
                cb(null, new AsyncKeyValueFile(_this, p, flag, newFile.toStats(), data));
            }
        });
    };
    AsyncKeyValueFileSystem.prototype.openFile = function (p, flag, cb) {
        var _this = this;
        var tx = this.store.beginTransaction('readonly');
        this.findINode(tx, p, function (e, inode) {
            if (noError(e, cb)) {
                tx.get(inode.id, function (e, data) {
                    if (noError(e, cb)) {
                        if (data === undefined) {
                            cb(ApiError.ENOENT(p));
                        }
                        else {
                            cb(null, new AsyncKeyValueFile(_this, p, flag, inode.toStats(), data));
                        }
                    }
                });
            }
        });
    };
    AsyncKeyValueFileSystem.prototype.removeEntry = function (p, isDir, cb) {
        var _this = this;
        var tx = this.store.beginTransaction('readwrite'), parent = path.dirname(p), fileName = path.basename(p);
        this.findINodeAndDirListing(tx, parent, function (e, parentNode, parentListing) {
            if (noErrorTx(e, tx, cb)) {
                if (!parentListing[fileName]) {
                    tx.abort(function () {
                        cb(ApiError.ENOENT(p));
                    });
                }
                else {
                    var fileNodeId = parentListing[fileName];
                    delete parentListing[fileName];
                    _this.getINode(tx, p, fileNodeId, function (e, fileNode) {
                        if (noErrorTx(e, tx, cb)) {
                            if (!isDir && fileNode.isDirectory()) {
                                tx.abort(function () {
                                    cb(ApiError.EISDIR(p));
                                });
                            }
                            else if (isDir && !fileNode.isDirectory()) {
                                tx.abort(function () {
                                    cb(ApiError.ENOTDIR(p));
                                });
                            }
                            else {
                                tx.delete(fileNode.id, function (e) {
                                    if (noErrorTx(e, tx, cb)) {
                                        tx.delete(fileNodeId, function (e) {
                                            if (noErrorTx(e, tx, cb)) {
                                                tx.put(parentNode.id, new Buffer(JSON.stringify(parentListing)), true, function (e) {
                                                    if (noErrorTx(e, tx, cb)) {
                                                        tx.commit(cb);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    AsyncKeyValueFileSystem.prototype.unlink = function (p, cb) {
        this.removeEntry(p, false, cb);
    };
    AsyncKeyValueFileSystem.prototype.rmdir = function (p, cb) {
        this.removeEntry(p, true, cb);
    };
    AsyncKeyValueFileSystem.prototype.mkdir = function (p, mode, cb) {
        var tx = this.store.beginTransaction('readwrite'), data = new Buffer('{}');
        this.commitNewFile(tx, p, node_fs_stats.FileType.DIRECTORY, mode, data, cb);
    };
    AsyncKeyValueFileSystem.prototype.readdir = function (p, cb) {
        var _this = this;
        var tx = this.store.beginTransaction('readonly');
        this.findINode(tx, p, function (e, inode) {
            if (noError(e, cb)) {
                _this.getDirListing(tx, p, inode, function (e, dirListing) {
                    if (noError(e, cb)) {
                        cb(null, Object.keys(dirListing));
                    }
                });
            }
        });
    };
    AsyncKeyValueFileSystem.prototype._sync = function (p, data, stats, cb) {
        var _this = this;
        var tx = this.store.beginTransaction('readwrite');
        this._findINode(tx, path.dirname(p), path.basename(p), function (e, fileInodeId) {
            if (noErrorTx(e, tx, cb)) {
                _this.getINode(tx, p, fileInodeId, function (e, fileInode) {
                    if (noErrorTx(e, tx, cb)) {
                        var inodeChanged = fileInode.update(stats);
                        tx.put(fileInode.id, data, true, function (e) {
                            if (noErrorTx(e, tx, cb)) {
                                if (inodeChanged) {
                                    tx.put(fileInodeId, fileInode.toBuffer(), true, function (e) {
                                        if (noErrorTx(e, tx, cb)) {
                                            tx.commit(cb);
                                        }
                                    });
                                }
                                else {
                                    tx.commit(cb);
                                }
                            }
                        });
                    }
                });
            }
        });
    };
    return AsyncKeyValueFileSystem;
})(file_system.BaseFileSystem);
exports.AsyncKeyValueFileSystem = AsyncKeyValueFileSystem;

},{"../core/api_error":11,"../core/buffer":13,"../core/file_system":20,"../core/node_fs_stats":23,"../core/node_path":24,"../generic/inode":29,"../generic/preload_file":31}],31:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var file = require('../core/file');
var buffer = require('../core/buffer');
var api_error = require('../core/api_error');
var node_fs_1 = require('../core/node_fs');
var ApiError = api_error.ApiError;
var ErrorCode = api_error.ErrorCode;
var Buffer = buffer.Buffer;
var PreloadFile = (function (_super) {
    __extends(PreloadFile, _super);
    function PreloadFile(_fs, _path, _flag, _stat, contents) {
        _super.call(this);
        this._pos = 0;
        this._dirty = false;
        this._fs = _fs;
        this._path = _path;
        this._flag = _flag;
        this._stat = _stat;
        if (contents != null) {
            this._buffer = contents;
        }
        else {
            this._buffer = new Buffer(0);
        }
        if (this._stat.size !== this._buffer.length && this._flag.isReadable()) {
            throw new Error("Invalid buffer: Buffer is " + this._buffer.length + " long, yet Stats object specifies that file is " + this._stat.size + " long.");
        }
    }
    PreloadFile.prototype.isDirty = function () {
        return this._dirty;
    };
    PreloadFile.prototype.resetDirty = function () {
        this._dirty = false;
    };
    PreloadFile.prototype.getBuffer = function () {
        return this._buffer;
    };
    PreloadFile.prototype.getStats = function () {
        return this._stat;
    };
    PreloadFile.prototype.getFlag = function () {
        return this._flag;
    };
    PreloadFile.prototype.getPath = function () {
        return this._path;
    };
    PreloadFile.prototype.getPos = function () {
        if (this._flag.isAppendable()) {
            return this._stat.size;
        }
        return this._pos;
    };
    PreloadFile.prototype.advancePos = function (delta) {
        return this._pos += delta;
    };
    PreloadFile.prototype.setPos = function (newPos) {
        return this._pos = newPos;
    };
    PreloadFile.prototype.sync = function (cb) {
        try {
            this.syncSync();
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    PreloadFile.prototype.syncSync = function () {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    PreloadFile.prototype.close = function (cb) {
        try {
            this.closeSync();
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    PreloadFile.prototype.closeSync = function () {
        throw new ApiError(ErrorCode.ENOTSUP);
    };
    PreloadFile.prototype.stat = function (cb) {
        try {
            cb(null, this._stat.clone());
        }
        catch (e) {
            cb(e);
        }
    };
    PreloadFile.prototype.statSync = function () {
        return this._stat.clone();
    };
    PreloadFile.prototype.truncate = function (len, cb) {
        try {
            this.truncateSync(len);
            if (this._flag.isSynchronous() && !node_fs_1.fs.getRootFS().supportsSynch()) {
                this.sync(cb);
            }
            cb();
        }
        catch (e) {
            return cb(e);
        }
    };
    PreloadFile.prototype.truncateSync = function (len) {
        this._dirty = true;
        if (!this._flag.isWriteable()) {
            throw new ApiError(ErrorCode.EPERM, 'File not opened with a writeable mode.');
        }
        this._stat.mtime = new Date();
        if (len > this._buffer.length) {
            var buf = new Buffer(len - this._buffer.length);
            buf.fill(0);
            this.writeSync(buf, 0, buf.length, this._buffer.length);
            if (this._flag.isSynchronous() && node_fs_1.fs.getRootFS().supportsSynch()) {
                this.syncSync();
            }
            return;
        }
        this._stat.size = len;
        var newBuff = new Buffer(len);
        this._buffer.copy(newBuff, 0, 0, len);
        this._buffer = newBuff;
        if (this._flag.isSynchronous() && node_fs_1.fs.getRootFS().supportsSynch()) {
            this.syncSync();
        }
    };
    PreloadFile.prototype.write = function (buffer, offset, length, position, cb) {
        try {
            cb(null, this.writeSync(buffer, offset, length, position), buffer);
        }
        catch (e) {
            cb(e);
        }
    };
    PreloadFile.prototype.writeSync = function (buffer, offset, length, position) {
        this._dirty = true;
        if (position == null) {
            position = this.getPos();
        }
        if (!this._flag.isWriteable()) {
            throw new ApiError(ErrorCode.EPERM, 'File not opened with a writeable mode.');
        }
        var endFp = position + length;
        if (endFp > this._stat.size) {
            this._stat.size = endFp;
            if (endFp > this._buffer.length) {
                var newBuff = new Buffer(endFp);
                this._buffer.copy(newBuff);
                this._buffer = newBuff;
            }
        }
        var len = buffer.copy(this._buffer, position, offset, offset + length);
        this._stat.mtime = new Date();
        if (this._flag.isSynchronous()) {
            this.syncSync();
            return len;
        }
        this.setPos(position + len);
        return len;
    };
    PreloadFile.prototype.read = function (buffer, offset, length, position, cb) {
        try {
            cb(null, this.readSync(buffer, offset, length, position), buffer);
        }
        catch (e) {
            cb(e);
        }
    };
    PreloadFile.prototype.readSync = function (buffer, offset, length, position) {
        if (!this._flag.isReadable()) {
            throw new ApiError(ErrorCode.EPERM, 'File not opened with a readable mode.');
        }
        if (position == null) {
            position = this.getPos();
        }
        var endRead = position + length;
        if (endRead > this._stat.size) {
            length = this._stat.size - position;
        }
        var rv = this._buffer.copy(buffer, offset, position, position + length);
        this._stat.atime = new Date();
        this._pos = position + length;
        return rv;
    };
    PreloadFile.prototype.chmod = function (mode, cb) {
        try {
            this.chmodSync(mode);
            cb();
        }
        catch (e) {
            cb(e);
        }
    };
    PreloadFile.prototype.chmodSync = function (mode) {
        if (!this._fs.supportsProps()) {
            throw new ApiError(ErrorCode.ENOTSUP);
        }
        this._dirty = true;
        this._stat.chmod(mode);
        this.syncSync();
    };
    return PreloadFile;
})(file.BaseFile);
exports.PreloadFile = PreloadFile;
var NoSyncFile = (function (_super) {
    __extends(NoSyncFile, _super);
    function NoSyncFile(_fs, _path, _flag, _stat, contents) {
        _super.call(this, _fs, _path, _flag, _stat, contents);
    }
    NoSyncFile.prototype.sync = function (cb) {
        cb();
    };
    NoSyncFile.prototype.syncSync = function () { };
    NoSyncFile.prototype.close = function (cb) {
        cb();
    };
    NoSyncFile.prototype.closeSync = function () { };
    return NoSyncFile;
})(PreloadFile);
exports.NoSyncFile = NoSyncFile;

},{"../core/api_error":11,"../core/buffer":13,"../core/file":18,"../core/node_fs":22}],32:[function(require,module,exports){
/**
 * Contains utility methods for performing a variety of tasks with
 * XmlHttpRequest across browsers.
 */
var util = require('../core/util');
var buffer = require('../core/buffer');
var api_error = require('../core/api_error');
var ApiError = api_error.ApiError;
var ErrorCode = api_error.ErrorCode;
var Buffer = buffer.Buffer;
function getIEByteArray(IEByteArray) {
    var rawBytes = IEBinaryToArray_ByteStr(IEByteArray);
    var lastChr = IEBinaryToArray_ByteStr_Last(IEByteArray);
    var data_str = rawBytes.replace(/[\s\S]/g, function (match) {
        var v = match.charCodeAt(0);
        return String.fromCharCode(v & 0xff, v >> 8);
    }) + lastChr;
    var data_array = new Array(data_str.length);
    for (var i = 0; i < data_str.length; i++) {
        data_array[i] = data_str.charCodeAt(i);
    }
    return data_array;
}
function downloadFileIE(async, p, type, cb) {
    switch (type) {
        case 'buffer':
        case 'json':
            break;
        default:
            return cb(new ApiError(ErrorCode.EINVAL, "Invalid download type: " + type));
    }
    var req = new XMLHttpRequest();
    req.open('GET', p, async);
    req.setRequestHeader("Accept-Charset", "x-user-defined");
    req.onreadystatechange = function (e) {
        var data_array;
        if (req.readyState === 4) {
            if (req.status === 200) {
                switch (type) {
                    case 'buffer':
                        data_array = getIEByteArray(req.responseBody);
                        return cb(null, new Buffer(data_array));
                    case 'json':
                        return cb(null, JSON.parse(req.responseText));
                }
            }
            else {
                return cb(new ApiError(req.status, "XHR error."));
            }
        }
    };
    req.send();
}
function asyncDownloadFileIE(p, type, cb) {
    downloadFileIE(true, p, type, cb);
}
function syncDownloadFileIE(p, type) {
    var rv;
    downloadFileIE(false, p, type, function (err, data) {
        if (err)
            throw err;
        rv = data;
    });
    return rv;
}
function asyncDownloadFileModern(p, type, cb) {
    var req = new XMLHttpRequest();
    req.open('GET', p, true);
    var jsonSupported = true;
    switch (type) {
        case 'buffer':
            req.responseType = 'arraybuffer';
            break;
        case 'json':
            try {
                req.responseType = 'json';
                jsonSupported = req.responseType === 'json';
            }
            catch (e) {
                jsonSupported = false;
            }
            break;
        default:
            return cb(new ApiError(ErrorCode.EINVAL, "Invalid download type: " + type));
    }
    req.onreadystatechange = function (e) {
        if (req.readyState === 4) {
            if (req.status === 200) {
                switch (type) {
                    case 'buffer':
                        return cb(null, new Buffer(req.response ? req.response : 0));
                    case 'json':
                        if (jsonSupported) {
                            return cb(null, req.response);
                        }
                        else {
                            return cb(null, JSON.parse(req.responseText));
                        }
                }
            }
            else {
                return cb(new ApiError(req.status, "XHR error."));
            }
        }
    };
    req.send();
}
function syncDownloadFileModern(p, type) {
    var req = new XMLHttpRequest();
    req.open('GET', p, false);
    var data = null;
    var err = null;
    req.overrideMimeType('text/plain; charset=x-user-defined');
    req.onreadystatechange = function (e) {
        if (req.readyState === 4) {
            if (req.status === 200) {
                switch (type) {
                    case 'buffer':
                        var text = req.responseText;
                        data = new Buffer(text.length);
                        for (var i = 0; i < text.length; i++) {
                            data.writeUInt8(text.charCodeAt(i), i);
                        }
                        return;
                    case 'json':
                        data = JSON.parse(req.responseText);
                        return;
                }
            }
            else {
                err = new ApiError(req.status, "XHR error.");
                return;
            }
        }
    };
    req.send();
    if (err) {
        throw err;
    }
    return data;
}
function syncDownloadFileIE10(p, type) {
    var req = new XMLHttpRequest();
    req.open('GET', p, false);
    switch (type) {
        case 'buffer':
            req.responseType = 'arraybuffer';
            break;
        case 'json':
            break;
        default:
            throw new ApiError(ErrorCode.EINVAL, "Invalid download type: " + type);
    }
    var data;
    var err;
    req.onreadystatechange = function (e) {
        if (req.readyState === 4) {
            if (req.status === 200) {
                switch (type) {
                    case 'buffer':
                        data = new Buffer(req.response);
                        break;
                    case 'json':
                        data = JSON.parse(req.response);
                        break;
                }
            }
            else {
                err = new ApiError(req.status, "XHR error.");
            }
        }
    };
    req.send();
    if (err) {
        throw err;
    }
    return data;
}
function getFileSize(async, p, cb) {
    var req = new XMLHttpRequest();
    req.open('HEAD', p, async);
    req.onreadystatechange = function (e) {
        if (req.readyState === 4) {
            if (req.status == 200) {
                try {
                    return cb(null, parseInt(req.getResponseHeader('Content-Length'), 10));
                }
                catch (e) {
                    return cb(new ApiError(ErrorCode.EIO, "XHR HEAD error: Could not read content-length."));
                }
            }
            else {
                return cb(new ApiError(req.status, "XHR HEAD error."));
            }
        }
    };
    req.send();
}
exports.asyncDownloadFile = (util.isIE && typeof Blob === 'undefined') ? asyncDownloadFileIE : asyncDownloadFileModern;
exports.syncDownloadFile = (util.isIE && typeof Blob === 'undefined') ? syncDownloadFileIE : (util.isIE && typeof Blob !== 'undefined') ? syncDownloadFileIE10 : syncDownloadFileModern;
function getFileSizeSync(p) {
    var rv;
    getFileSize(false, p, function (err, size) {
        if (err) {
            throw err;
        }
        rv = size;
    });
    return rv;
}
exports.getFileSizeSync = getFileSizeSync;
function getFileSizeAsync(p, cb) {
    getFileSize(true, p, cb);
}
exports.getFileSizeAsync = getFileSizeAsync;

},{"../core/api_error":11,"../core/buffer":13,"../core/util":27}]},{},[3]);
