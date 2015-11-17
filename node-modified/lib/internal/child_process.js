'use strict';

var StringDecoder = require('../string_decoder').StringDecoder;
var Buffer = require('../buffer').Buffer;
var EventEmitter = require('../events');
//var net = require('./net');
var util = require('../util');
var constants = require('../constants');
var assert = require('../assert');

var Process = process.binding('process_wrap').Process;
var uv = process.binding('uv');
var Pipe = process.binding('pipe_wrap').Pipe;
var TTY = process.binding('tty_wrap').TTY;

var errnoException = util._errnoException;

module.exports = {
  ChildProcess,
  setupChannel,
  _validateStdio,
  fork,
};

function fork(modulePath) {
  throw new Error('fork not available');
}

function ChildProcess() {
  EventEmitter.call(this);

  var self = this;

  this._closesNeeded = 1;
  this._closesGot = 0;
  this.connected = false;

  this.signalCode = null;
  this.exitCode = null;
  this.killed = false;
  this.spawnfile = null;

  this._handle = new Process();
  this._handle.owner = this;

  this._handle.onexit = function(exitCode, signalCode) {
    //
    // follow 0.4.x behaviour:
    //
    // - normally terminated processes don't touch this.signalCode
    // - signaled processes don't touch this.exitCode
    //
    // new in 0.9.x:
    //
    // - spawn failures are reported with exitCode < 0
    //
    var syscall = self.spawnfile ? 'spawn ' + self.spawnfile : 'spawn';
    var err = (exitCode < 0) ? errnoException(exitCode, syscall) : null;

    if (signalCode) {
      self.signalCode = signalCode;
    } else {
      self.exitCode = exitCode;
    }

    if (self.stdin) {
      self.stdin.destroy();
    }

    self._handle.close();
    self._handle = null;

    if (exitCode < 0) {
      if (self.spawnfile)
        err.path = self.spawnfile;

      err.spawnargs = self.spawnargs.slice(1);
      self.emit('error', err);
    } else {
      self.emit('exit', self.exitCode, self.signalCode);
    }

    // if any of the stdio streams have not been touched,
    // then pull all the data through so that it can get the
    // eof and emit a 'close' event.
    // Do it on nextTick so that the user has one last chance
    // to consume the output, if for example they only want to
    // start reading the data once the process exits.
    process.nextTick(flushStdio, self);

    maybeClose(self);
  };
}
util.inherits(ChildProcess, EventEmitter);


function flushStdio(subprocess) {
  if (subprocess.stdio == null) return;
  subprocess.stdio.forEach(function(stream, fd, stdio) {
    if (!stream || !stream.readable || stream._consuming)
      return;
    stream.resume();
  });
}


function createSocket(pipe, readable) {
    /*
  var s = new net.Socket({ handle: pipe });

  if (readable) {
    s.writable = false;
    s.readable = true;
  } else {
    s.writable = true;
    s.readable = false;
  }

  return s;
    */
    throw new Error('createSocket not implemented');
}


function getHandleWrapType(stream) {
  if (stream instanceof Pipe) return 'pipe';
  if (stream instanceof TTY) return 'tty';

  return false;
}


ChildProcess.prototype.spawn = function(options) {
  var self = this,
      ipc,
      ipcFd,
      // If no `stdio` option was given - use default
      stdio = options.stdio || 'pipe';

  stdio = _validateStdio(stdio, false);

  ipc = stdio.ipc;
  ipcFd = stdio.ipcFd;
  stdio = options.stdio = stdio.stdio;

  if (ipc !== undefined) {
    // Let child process know about opened IPC channel
    options.envPairs = options.envPairs || [];
    options.envPairs.push('NODE_CHANNEL_FD=' + ipcFd);
  }

  this.spawnfile = options.file;
  this.spawnargs = options.args;

  var err = this._handle.spawn(options);

  // Run-time errors should emit an error, not throw an exception.
  if (err === uv.UV_EAGAIN ||
      err === uv.UV_EMFILE ||
      err === uv.UV_ENFILE ||
      err === uv.UV_ENOENT) {
    process.nextTick(onErrorNT, self, err);
    // There is no point in continuing when we've hit EMFILE or ENFILE
    // because we won't be able to set up the stdio file descriptors.
    // It's kind of silly that the de facto spec for ENOENT (the test suite)
    // mandates that stdio _is_ set up, even if there is no process on the
    // receiving end, but it is what it is.
    if (err !== uv.UV_ENOENT) return err;
  } else if (err) {
    // Close all opened fds on error
    stdio.forEach(function(stdio) {
      if (stdio.type === 'pipe') {
        stdio.handle.close();
      }
    });

    this._handle.close();
    this._handle = null;
    throw errnoException(err, 'spawn');
  }

  this.pid = this._handle.pid;

  stdio.forEach(function(stdio, i) {
    if (stdio.type === 'ignore') return;

    if (stdio.ipc) {
      self._closesNeeded++;
      return;
    }

    if (stdio.handle) {
      // when i === 0 - we're dealing with stdin
      // (which is the only one writable pipe)
      stdio.socket = createSocket(self.pid !== 0 ? stdio.handle : null, i > 0);

      if (i > 0 && self.pid !== 0) {
        self._closesNeeded++;
        stdio.socket.on('close', function() {
          maybeClose(self);
        });
      }
    }
  });

  this.stdin = stdio.length >= 1 && stdio[0].socket !== undefined ?
      stdio[0].socket : null;
  this.stdout = stdio.length >= 2 && stdio[1].socket !== undefined ?
      stdio[1].socket : null;
  this.stderr = stdio.length >= 3 && stdio[2].socket !== undefined ?
      stdio[2].socket : null;

  this.stdio = stdio.map(function(stdio) {
    return stdio.socket === undefined ? null : stdio.socket;
  });

  // Add .send() method and start listening for IPC data
  if (ipc !== undefined) setupChannel(this, ipc);

  return err;
};


function onErrorNT(self, err) {
  self._handle.onexit(err);
}


ChildProcess.prototype.kill = function(sig) {
  var signal;

  if (sig === 0) {
    signal = 0;
  } else if (!sig) {
    signal = constants['SIGTERM'];
  } else {
    signal = constants[sig];
  }

  if (signal === undefined) {
    throw new Error('Unknown signal: ' + sig);
  }

  if (this._handle) {
    var err = this._handle.kill(signal);
    if (err === 0) {
      /* Success. */
      this.killed = true;
      return true;
    }
    if (err === uv.UV_ESRCH) {
      /* Already dead. */
    } else if (err === uv.UV_EINVAL || err === uv.UV_ENOSYS) {
      /* The underlying platform doesn't support this signal. */
      throw errnoException(err, 'kill');
    } else {
      /* Other error, almost certainly EPERM. */
      this.emit('error', errnoException(err, 'kill'));
    }
  }

  /* Kill didn't succeed. */
  return false;
};


ChildProcess.prototype.ref = function() {
  if (this._handle) this._handle.ref();
};


ChildProcess.prototype.unref = function() {
  if (this._handle) this._handle.unref();
};


function setupChannel(target, channel) {
  throw new Error('setupChannel not implemented in browser-node');
}


var INTERNAL_PREFIX = 'NODE_';
function handleMessage(target, message, handle) {
  var eventName = 'message';
  if (message !== null &&
      typeof message === 'object' &&
      typeof message.cmd === 'string' &&
      message.cmd.length > INTERNAL_PREFIX.length &&
      message.cmd.slice(0, INTERNAL_PREFIX.length) === INTERNAL_PREFIX) {
    eventName = 'internalMessage';
  }
  target.emit(eventName, message, handle);
}

function nop() { }

function _validateStdio(stdio, sync) {
  var ipc,
      ipcFd;

  // Replace shortcut with an array
  if (typeof stdio === 'string') {
    switch (stdio) {
      case 'ignore': stdio = ['ignore', 'ignore', 'ignore']; break;
      case 'pipe': stdio = ['pipe', 'pipe', 'pipe']; break;
      case 'inherit': stdio = [0, 1, 2]; break;
      default: throw new TypeError('Incorrect value of stdio option: ' + stdio);
    }
  } else if (!Array.isArray(stdio)) {
    throw new TypeError('Incorrect value of stdio option: ' +
        util.inspect(stdio));
  }

  // At least 3 stdio will be created
  // Don't concat() a new Array() because it would be sparse, and
  // stdio.reduce() would skip the sparse elements of stdio.
  // See http://stackoverflow.com/a/5501711/3561
  while (stdio.length < 3) stdio.push(undefined);

  // Translate stdio into C++-readable form
  // (i.e. PipeWraps or fds)
  stdio = stdio.reduce(function(acc, stdio, i) {
    function cleanup() {
      acc.filter(function(stdio) {
        return stdio.type === 'pipe' || stdio.type === 'ipc';
      }).forEach(function(stdio) {
        if (stdio.handle)
          stdio.handle.close();
      });
    }

    // Defaults
    if (stdio === null || stdio === undefined) {
      stdio = i < 3 ? 'pipe' : 'ignore';
    }

    if (stdio === null || stdio === 'ignore') {
      acc.push({type: 'ignore'});
    } else if (stdio === 'pipe' || typeof stdio === 'number' && stdio < 0) {
      var a = {
        type: 'pipe',
        readable: i === 0,
        writable: i !== 0
      };

      if (!sync)
        a.handle = new Pipe();

      acc.push(a);
    } else if (stdio === 'ipc') {
      if (sync || ipc !== undefined) {
        // Cleanup previously created pipes
        cleanup();
        if (!sync)
          throw new Error('Child process can have only one IPC pipe');
        else
          throw new Error('You cannot use IPC with synchronous forks');
      }

      ipc = new Pipe(true);
      ipcFd = i;

      acc.push({
        type: 'pipe',
        handle: ipc,
        ipc: true
      });
    } else if (stdio === 'inherit') {
      acc.push({
        type: 'inherit',
        fd: i
      });
    } else if (typeof stdio === 'number' || typeof stdio.fd === 'number') {
      acc.push({
        type: 'fd',
        fd: typeof stdio === 'number' ? stdio : stdio.fd
      });
    } else if (getHandleWrapType(stdio) || getHandleWrapType(stdio.handle) ||
               getHandleWrapType(stdio._handle)) {
      var handle = getHandleWrapType(stdio) ?
          stdio :
          getHandleWrapType(stdio.handle) ? stdio.handle : stdio._handle;

      acc.push({
        type: 'wrap',
        wrapType: getHandleWrapType(handle),
        handle: handle
      });
    } else if (stdio instanceof Buffer || typeof stdio === 'string') {
      if (!sync) {
        cleanup();
        throw new TypeError('Asynchronous forks do not support Buffer input: ' +
            util.inspect(stdio));
      }
    } else {
      // Cleanup
      cleanup();
      throw new TypeError('Incorrect value for stdio stream: ' +
          util.inspect(stdio));
    }

    return acc;
  }, []);

  return {stdio: stdio, ipc: ipc, ipcFd: ipcFd};
}


function maybeClose(subprocess) {
  subprocess._closesGot++;

  if (subprocess._closesGot == subprocess._closesNeeded) {
    subprocess.emit('close', subprocess.exitCode, subprocess.signalCode);
  }
}
