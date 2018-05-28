(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var AF;
(function (AF) {
    AF[AF["UNSPEC"] = 0] = "UNSPEC";
    AF[AF["LOCAL"] = 1] = "LOCAL";
    AF[AF["UNIX"] = 1] = "UNIX";
    AF[AF["FILE"] = 1] = "FILE";
    AF[AF["INET"] = 2] = "INET";
    AF[AF["INET6"] = 10] = "INET6";
})(AF = exports.AF || (exports.AF = {}));
var SOCK;
(function (SOCK) {
    SOCK[SOCK["STREAM"] = 1] = "STREAM";
    SOCK[SOCK["DGRAM"] = 2] = "DGRAM";
})(SOCK = exports.SOCK || (exports.SOCK = {}));
var ErrorCode;
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
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
var fsErrors = {
    EPERM: 'Operation not permitted.',
    ENOENT: 'No such file or directory.',
    EIO: 'Input/output error.',
    EBADF: 'Bad file descriptor.',
    EACCES: 'Permission denied.',
    EBUSY: 'Resource busy or locked.',
    EEXIST: 'File exists.',
    ENOTDIR: 'File is not a directory.',
    EISDIR: 'File is a directory.',
    EINVAL: 'Invalid argument.',
    EFBIG: 'File is too big.',
    ENOSPC: 'No space left on disk.',
    EROFS: 'Cannot modify a read-only file system.',
    ENOTEMPTY: 'Directory is not empty.',
    ENOTSUP: 'Operation is not supported.',
};
var ApiError = (function () {
    function ApiError(type, message) {
        this.type = type;
        this.code = ErrorCode[type];
        if (message != null) {
            this.message = message;
        }
        else {
            this.message = fsErrors[type];
        }
    }
    ApiError.prototype.toString = function () {
        return this.code + ": " + fsErrors[this.code] + " " + this.message;
    };
    return ApiError;
}());
exports.ApiError = ApiError;
function convertApiErrors(e) {
    if (!e)
        return e;
    if (!e.hasOwnProperty('type') || !e.hasOwnProperty('message') || !e.hasOwnProperty('code'))
        return e;
    return new ApiError(e.type, e.message);
}
var SyscallResponse = (function () {
    function SyscallResponse(id, name, args) {
        this.id = id;
        this.name = name;
        this.args = args;
    }
    SyscallResponse.From = function (ev) {
        if (!ev.data)
            return;
        for (var i = 0; i < SyscallResponse.requiredOnData.length; i++) {
            if (!ev.data.hasOwnProperty(SyscallResponse.requiredOnData[i]))
                return;
        }
        var args = ev.data.args.map(convertApiErrors);
        return new SyscallResponse(ev.data.id, ev.data.name, args);
    };
    SyscallResponse.requiredOnData = ['id', 'name', 'args'];
    return SyscallResponse;
}());
exports.SyscallResponse = SyscallResponse;
var USyscalls = (function () {
    function USyscalls(port) {
        this.msgIdSeq = 1;
        this.outstanding = {};
        this.signalHandlers = {};
        this.port = port;
        this.port.onmessage = this.resultHandler.bind(this);
    }
    USyscalls.prototype.exit = function (code) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log('received callback for exit(), should clean up');
        };
        this.post(msgId, 'exit', code);
    };
    USyscalls.prototype.fork = function (heap, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'fork', heap);
    };
    USyscalls.prototype.kill = function (pid, sig, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'kill', pid, sig);
    };
    USyscalls.prototype.wait4 = function (pid, options, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'wait4', pid, options);
    };
    USyscalls.prototype.socket = function (domain, type, protocol, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'socket', domain, type, protocol);
    };
    USyscalls.prototype.getsockname = function (fd, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'getsockname', fd);
    };
    USyscalls.prototype.getpeername = function (fd, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'getpeername', fd);
    };
    USyscalls.prototype.bind = function (fd, sockInfo, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'bind', fd, sockInfo);
    };
    USyscalls.prototype.listen = function (fd, backlog, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'listen', fd, backlog);
    };
    USyscalls.prototype.accept = function (fd, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'accept', fd);
    };
    USyscalls.prototype.connect = function (fd, addr, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'connect', fd, addr);
    };
    USyscalls.prototype.fcntl = function (cmd, arg, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'fcntl', cmd, arg);
    };
    USyscalls.prototype.getcwd = function (cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'getcwd');
    };
    USyscalls.prototype.getpid = function (cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'getpid');
    };
    USyscalls.prototype.getppid = function (cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'getppid');
    };
    USyscalls.prototype.spawn = function (cwd, name, args, env, files, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'spawn', cwd, name, args, env, files);
    };
    USyscalls.prototype.pipe2 = function (flags, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'pipe2', flags);
    };
    USyscalls.prototype.getpriority = function (which, who, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'getpriority', which, who);
    };
    USyscalls.prototype.setpriority = function (which, who, prio, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'setpriority', which, who, prio);
    };
    USyscalls.prototype.open = function (path, flags, mode, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'open', path, flags, mode);
    };
    USyscalls.prototype.unlink = function (path, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'unlink', path);
    };
    USyscalls.prototype.unlinkat = function (fd, path, flags, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'unlinkat', fd, path, flags);
    };
    USyscalls.prototype.flock = function (fd, operation, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'flock', fd, operation);
    };
    USyscalls.prototype.utimes = function (path, atime, mtime, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'utimes', path, atime, mtime);
    };
    USyscalls.prototype.futimes = function (fd, atime, mtime, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'futimes', fd, atime, mtime);
    };
    USyscalls.prototype.rmdir = function (path, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'rmdir', path);
    };
    USyscalls.prototype.mkdir = function (path, mode, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'mkdir', path);
    };
    USyscalls.prototype.close = function (fd, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'close', fd);
    };
    USyscalls.prototype.pwrite = function (fd, buf, pos, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'pwrite', fd, buf, pos);
    };
    USyscalls.prototype.readdir = function (path, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'readdir', path);
    };
    USyscalls.prototype.fstat = function (fd, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'fstat', fd);
    };
    USyscalls.prototype.lstat = function (path, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'lstat', path);
    };
    USyscalls.prototype.chdir = function (path, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'chdir', path);
    };
    USyscalls.prototype.stat = function (path, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'stat', path);
    };
    USyscalls.prototype.ioctl = function (fd, request, length, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'ioctl', fd, request, length);
    };
    USyscalls.prototype.readlink = function (path, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'readlink', path);
    };
    USyscalls.prototype.getdents = function (fd, length, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'getdents', fd, length);
    };
    USyscalls.prototype.pread = function (fd, length, offset, cb) {
        var msgId = this.nextMsgId();
        this.outstanding[msgId] = cb;
        this.post(msgId, 'pread', fd, length, offset);
    };
    USyscalls.prototype.addEventListener = function (type, handler) {
        if (!handler)
            return;
        if (this.signalHandlers[type])
            this.signalHandlers[type].push(handler);
        else
            this.signalHandlers[type] = [handler];
    };
    USyscalls.prototype.resultHandler = function (ev) {
        var response = SyscallResponse.From(ev);
        if (!response) {
            console.log('bad usyscall message, dropping');
            console.log(ev);
            return;
        }
        if (response.name) {
            var handlers = this.signalHandlers[response.name];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++)
                    handlers[i](response);
            }
            else {
                console.log('unhandled signal ' + response.name);
            }
            return;
        }
        this.complete(response.id, response.args);
    };
    USyscalls.prototype.complete = function (id, args) {
        var cb = this.outstanding[id];
        delete this.outstanding[id];
        if (cb) {
            cb.apply(undefined, args);
        }
        else {
            console.log('unknown callback for msg ' + id + ' - ' + args);
        }
    };
    USyscalls.prototype.nextMsgId = function () {
        return ++this.msgIdSeq;
    };
    USyscalls.prototype.post = function (msgId, name) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.port.postMessage({
            id: msgId,
            name: name,
            args: args,
        });
    };
    return USyscalls;
}());
exports.USyscalls = USyscalls;
function getGlobal() {
    if (typeof window !== "undefined") {
        return window;
    }
    else if (typeof self !== "undefined") {
        return self;
    }
    else if (typeof global !== "undefined") {
        return global;
    }
    else {
        return this;
    }
}
exports.getGlobal = getGlobal;
exports.syscall = new USyscalls(getGlobal());

},{}],2:[function(require,module,exports){
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var syscall_1 = require("../browser-node/syscall");
var table_1 = require("./table");
function Syscall(cb, trap) {
    table_1.syscallTbl[trap].apply(this, arguments);
}
exports.Syscall = Syscall;
exports.Syscall6 = Syscall;
exports.internal = syscall_1.syscall;
var OnceEmitter = (function () {
    function OnceEmitter() {
        this.listeners = {};
    }
    OnceEmitter.prototype.once = function (event, cb) {
        var cbs = this.listeners[event];
        if (!cbs)
            cbs = [cb];
        else
            cbs.push(cb);
        this.listeners[event] = cbs;
    };
    OnceEmitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var cbs = this.listeners[event];
        this.listeners[event] = [];
        if (!cbs)
            return;
        for (var i = 0; i < cbs.length; i++) {
            cbs[i].apply(null, args);
        }
    };
    return OnceEmitter;
}());
var Process = (function (_super) {
    __extends(Process, _super);
    function Process(argv, environ) {
        var _this = _super.call(this) || this;
        _this.argv = argv;
        _this.env = environ;
        return _this;
    }
    Process.prototype.exit = function (code) {
        if (code === void 0) { code = 0; }
        syscall_1.syscall.exit(code);
    };
    return Process;
}(OnceEmitter));
var process = new Process(null, null);
syscall_1.syscall.addEventListener('init', init.bind(this));
function init(data) {
    'use strict';
    var args = data.args[0];
    var environ = data.args[1];
    args = [args[0]].concat(args);
    process.argv = args;
    process.env = environ;
    setTimeout(function () { process.emit('ready'); }, 0);
}
if (typeof window !== "undefined") {
    window.$syscall = exports;
    window.process = process;
}
else if (typeof self !== "undefined") {
    self.$syscall = exports;
    self.process = process;
}
else if (typeof global !== "undefined") {
    global.$syscall = exports;
}
else {
    this.$syscall = exports;
    this.process = process;
}

},{"../browser-node/syscall":1,"./table":3}],3:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var syscall_1 = require("./../browser-node/syscall");
var ENOSYS = 38;
var AT_FDCWD = -0x64;
function sys_ni_syscall(cb, trap) {
    console.log('TEST ni syscall ' + trap);
    debugger;
    setTimeout(cb, 0, [-1, 0, -ENOSYS]);
}
function sys_wait4(cb, trap, pid, wstatus, options, rusage) {
    var done = function (pid, wstatusIn, rusage) {
        if (rusage === void 0) { rusage = null; }
        if (pid > 0)
            wstatus.$set(wstatusIn);
        cb([pid, 0, 0]);
    };
    syscall_1.syscall.wait4(pid, options, done);
}
function sys_kill(cb, trap, pid, sig) {
    var done = function (err) {
        cb([err ? -1 : 0, 0, err ? -err : 0]);
    };
    syscall_1.syscall.kill(pid, sig, done);
}
function sys_getpid(cb, trap) {
    var done = function (err, pid) {
        cb([pid, 0, 0]);
    };
    syscall_1.syscall.getpid(done);
}
function sys_getppid(cb, trap) {
    var done = function (err, pid) {
        cb([pid, 0, 0]);
    };
    syscall_1.syscall.getppid(done);
}
var zeroBuf = new Uint8Array(0);
function sys_spawn(cb, trap, dir, argv0, argv, envv, fds) {
    if (!(dir instanceof Uint8Array))
        dir = zeroBuf;
    if (!(argv0 instanceof Uint8Array))
        argv0 = zeroBuf;
    argv = argv.filter(function (x) { return x instanceof Uint8Array; });
    envv = envv.filter(function (x) { return x instanceof Uint8Array; });
    var done = function (err, pid) {
        cb([err ? -1 : pid, 0, err ? err : 0]);
    };
    syscall_1.syscall.spawn(dir, argv0, argv, envv, fds, done);
}
function sys_pipe2(cb, trap, fds, flags) {
    var done = function (err, fd1, fd2) {
        if (!err) {
            fds[0] = fd1;
            fds[1] = fd2;
        }
        cb([err ? err : 0, 0, err ? err : 0]);
    };
    syscall_1.syscall.pipe2(flags, done);
}
function sys_fcntl(cb, trap, cmd, arg) {
    var done = function (err) {
        cb(err);
    };
    syscall_1.syscall.fcntl(cmd, arg, done);
}
function sys_getcwd(cb, trap, path, len) {
    var done = function (p) {
        path.subarray(0, len).set(p);
        var nullPos = p.length;
        if (nullPos >= path.byteLength)
            nullPos = path.byteLength;
        path[nullPos] = 0;
        cb([p.length + 1, 0, 0]);
    };
    syscall_1.syscall.getcwd(done);
}
function sys_chdir(cb, trap, path) {
    var done = function (err) {
        cb([err ? -1 : 0, 0, err ? -err : 0]);
    };
    var len = path.length;
    if (len && path[path.length - 1] === 0)
        len--;
    syscall_1.syscall.chdir(path.subarray(0, len), done);
}
function sys_ioctl(cb, trap, fd, request, argp) {
    var done = function (err, buf) {
        if (!err && argp.byteLength !== undefined) {
            argp.set(buf);
            cb([err ? err : buf.byteLength, 0, err ? -1 : 0]);
        }
        cb([err, 0, -1]);
    };
    syscall_1.syscall.ioctl(fd, request, argp.byteLength, done);
}
function sys_getdents64(cb, trap, fd, buf, len) {
    var done = function (err, dents) {
        if (dents)
            buf.set(dents);
        cb([err, 0, err < 0 ? -1 : 0]);
    };
    syscall_1.syscall.getdents(fd, len, done);
}
function sys_read(cb, trap, fd, readArray, readLen) {
    var done = function (err, dataLen, data) {
        if (!err) {
            for (var i = 0; i < dataLen; i++)
                readArray[i] = data[i];
        }
        cb([dataLen, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.pread(fd, readLen, -1, done);
}
function sys_write(cb, trap, fd, buf, blen) {
    var done = function (err, len) {
        cb([len, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.pwrite(fd, new Uint8Array(buf, 0, blen), -1, done);
}
function sys_stat(cb, trap, path, buf) {
    var done = function (err, stats) {
        if (!err)
            buf.set(stats);
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    var len = path.length;
    if (len && path[path.length - 1] === 0)
        len--;
    syscall_1.syscall.stat(path.subarray(0, len), done);
}
function sys_lstat(cb, trap, path, buf) {
    var done = function (err, stats) {
        if (!err)
            buf.set(stats);
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    var len = path.length;
    if (len && path[path.length - 1] === 0)
        len--;
    syscall_1.syscall.lstat(path.subarray(0, len), done);
}
function sys_fstat(cb, trap, fd, buf) {
    var done = function (err, stats) {
        if (!err)
            buf.set(stats);
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.fstat(fd, done);
}
function sys_readlinkat(cb, trap, fd, path, buf, blen) {
    if (fd !== AT_FDCWD) {
        console.log('openat: TODO: we only support AT_FDCWD');
        setTimeout(cb, 0, [-1, 0, -1]);
        return;
    }
    var done = function (err, linkString) {
        if (!err)
            buf.set(linkString);
        cb([err ? -1 : linkString.length, 0, err ? -1 : 0]);
    };
    var len = path.length;
    if (len && path[path.length - 1] === 0)
        len--;
    syscall_1.syscall.readlink(path.subarray(0, len), done);
}
function sys_openat(cb, trap, fd, path, flags, mode) {
    fd = fd | 0;
    if (fd !== AT_FDCWD) {
        console.log('openat: TODO: we only support AT_FDCWD');
        setTimeout(cb, 0, [-1, 0, -1]);
        return;
    }
    var done = function (err, fd) {
        cb([fd, 0, err ? -1 : 0]);
    };
    var len = path.length;
    if (len && path[path.length - 1] === 0)
        len--;
    syscall_1.syscall.open(path.subarray(0, len), flags, mode, done);
}
function sys_close(cb, trap, fd) {
    var done = function (err) {
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.close(fd, done);
}
function sys_exit_group(cb, trap, code) {
    syscall_1.syscall.exit(code);
}
function sys_socket(cb, trap, domain, type, protocol) {
    var done = function (err, fd) {
        cb([err ? -1 : fd, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.socket(domain, type, protocol, done);
}
function sys_bind(cb, trap, fd, buf, blen) {
    var done = function (err) {
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.bind(fd, buf.subarray(0, blen), done);
}
function sys_listen(cb, trap, fd, backlog) {
    var done = function (err) {
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.listen(fd, backlog, done);
}
function sys_connect(cb, trap, fd, buf, blen) {
    var done = function (err) {
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.connect(fd, buf.subarray(0, blen), done);
}
function sys_getsockname(cb, trap, fd, buf, lenp) {
    var done = function (err, sockInfo) {
        if (!err) {
            buf.set(sockInfo);
            lenp.$set(sockInfo.byteLength);
        }
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.getsockname(fd, done);
}
function sys_getpeername(cb, trap, fd, buf, lenp) {
    var done = function (err, sockInfo) {
        if (!err) {
            buf.set(sockInfo);
            lenp.$set(sockInfo.byteLength);
        }
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.getpeername(fd, done);
}
function sys_accept4(cb, trap, fd, buf, lenp) {
    var done = function (err, fd, sockInfo) {
        buf.set(sockInfo);
        lenp.$set(sockInfo.length);
        cb([err ? -1 : fd, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.accept(fd, done);
}
function sys_setsockopt(cb, trap) {
    console.log('FIXME: implement setsockopt');
    setTimeout(cb, 0, [0, 0, 0]);
}
function sys_unlinkat(cb, trap, fd, path, flags) {
    var done = function (err) {
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.unlinkat(fd, path, flags, done);
}
function sys_flock(cb, fd, operation) {
    var done = function (err) {
        cb([err ? -1 : 0, 0, err ? -1 : 0]);
    };
    syscall_1.syscall.flock(fd, operation, done);
}
exports.syscallTbl = [
    sys_read,
    sys_write,
    sys_ni_syscall,
    sys_close,
    sys_stat,
    sys_fstat,
    sys_lstat,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ioctl,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_getpid,
    sys_ni_syscall,
    sys_socket,
    sys_connect,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_bind,
    sys_listen,
    sys_getsockname,
    sys_getpeername,
    sys_ni_syscall,
    sys_setsockopt,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_wait4,
    sys_kill,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_fcntl,
    sys_flock,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_getcwd,
    sys_chdir,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_getppid,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_getdents64,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_exit_group,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_openat,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_unlinkat,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_readlinkat,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_accept4,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_pipe2,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_ni_syscall,
    sys_spawn,
];

},{"./../browser-node/syscall":1}]},{},[2]);
