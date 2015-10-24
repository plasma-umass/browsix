```
 __   __    ___             ___  ____  _   _
|__\ |__\  /   \  \   ^  / |___   ||    \ /
|__/ |  \  \___/   \/  \/   ___| _||_  _/ \_
```

Release version 1.0.0 (Archimedes)
October 23rd, 2015

README
------

Browsix is a UNIX-like processing model and kernel designed to run in modern web browsers.
The purpose of this Readme is to provide detailed instructions for running and testing Browsix, as well as a few hints for those wishing to read and edit the code. For information about the Browsix system design, see the [report](report.pdf).  The report can be rebuilt using:

    $ make report

WEBSITE
-------
https://github.com/plasma-umass/project-1-brash-browser-shell-bobby-and-craig


CONTACT
-------
If you have questions, comments, suggestions or concerns, please contact bobbypowers@gmail.com or q7h0u6h7@gmail.com

RUNNING & TESTING
-----------------

Browsix supports single-click builds by depending on a combination of GNU Make and [npm](https://www.npmjs.com/), and has the following simple prerequisites:

- [node.js](https://nodejs.org/en/)) - tested under version 4.1
- A C and C++ compiler (for node extensions)
- GNU Make

On Mac OS X, the compiler and GNU Make are provided by Apple's Xcode developer tools, and node is best installed through [Homebrew](http://brew.sh/).

To run the web terminal, type `$ make serve` on the command line while in the project directory.  To run the the tests execute `$ make test-browser`.  The initial run may take several minutes as dependencies are installed, but subsequent runs will be quicker.  To run the tests after starting `make test-browser`, open a browser and type http://localhost:9876 in the address bar.  That’s it! Tests have been run and pass using Node 4 under:
- Safari 9.0.1 (Mac)
- Firefox 41.0.2 (Linux)
- Chrome 47.0.2526 (Linux)
- Chrome 46.0.2490 (Windows 10)
- Edge 12.10240.0 (Windows 10)

CODE
----
The typescript src files for kernel, browser-node, and utilities in [./src/kernel](src/kernel), [./src/broswer-node](src/browser-node), and [./src/bin](src/bin), respectively.  After running `make` (either the test, serve, or bin targets) compiled commands are available in [./fs/usr/bin](fs/usr/bin). These can be invoked directly - they have a shebang line that specifies node as the interpreter. Tests can be found in [./test](test). Both the syscalls and bindings can be found in [./src/browser-node](src/browser-node) directory in [syscall.ts](src/browser-node/syscall.ts) and the [binding](src/browser-node/binding) subdir.

To enter into interactive debugging, open [./src/kernel/kernel.ts](src/kernel/kernel.ts), and change the following line from:

    let DEBUG = false;

to:

    let DEBUG = true;

This will delay execution of code in child process Web Workers, allowing you to breakpoint the worker.  See section 5 in the [report](report.pdf) for more information.  Run the tests and use chrome’s debugging tools.

Open Source
-----------

This projets incorporates code from several sources.  node's nextTick
functionality is provided by code from the
[acorn](https://github.com/marijnh/acorn) project, released under the
MIT license.  A large portion of the
[node](https://github.com/nodejs/node) standard library is used.  Node
itself incorporates several projects, and the relevant licenses can be
found [here](https://github.com/nodejs/node/blob/master/LICENSE).
Functions to convert buffers to utf-8 strings and back functions are
based off of
[browserify](https://github.com/substack/node-browserify/blob/master/LICENSE)
implementations, released under the same license as node. Provided without guarantee, so don’t use this to launch missiles or perform delicate surgery (seriously).
