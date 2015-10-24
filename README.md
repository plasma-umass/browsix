 __   __    ___             ___  ____  _   _
|__\ |__\  /   \  \   ^  / |___   ||    \ /
|__/ |  \  \___/   \/  \/   ___| _||_  _/ \_

Release version 1.0.0 (Archimedes)
October 23rd, 2015

README
------
Browsix is a UNIX-like processing model and kernel designed to run in modern web browsers.
The purpose of this Readme is to provide detailed instructions for running and testing Browsix, as well as a few hints for those wishing to read and edit the code. For information about the Browsix system design, see the report at ./report.tex

WEBSITE
-------
https://github.com/plasma-umass/project-1-brash-browser-shell-bobby-and-craig

CONTACT
-------
If you have questions, comments, suggestions or concerns, please contact bobbypowers@gmail.com or q7h0u6h7@gmail.com

RUNNING & TESTING
-----------------
One of the advantages of the Browsix design is that running and testing is quite simple. Using a combination of make, npm, and bower, package installation is handled automatically e.g., browserfs is pulled in through npm.  The exceptions to this are the following pre-reqs, which must be installed prior to building Browsix:
Node.js (see https://nodejs.org/en/)
a C compiler (e.g., https://gcc.gnu.org/)
gnu make (see https://www.gnu.org/software/make/)

To run the web terminal, type `$ make serve` on the command line while in the project directory.  To run the the tests type “make test” instead. If a browser doesn’t automatically pop up on running make test, open a browser and type localhost:9876 in the address bar.  That’s it! Tests have been run and pass using Node4 under:
- Safari 9.0.1 (Mac)
- Firefox 41.0.2 (Linux)
- Chrome 47.0.2526 (Linux)
- Chrome 46.0.2490 (Windows 10)
- Edge 12.10240.0 (Windows 10)

CODE
----
The typescript src files for kernel, browser-node, and utilities in ./src/kernel, ./src/broswer-node, and ./src/bin, respectively. Complied JavaScript code can be found in the same place, but replacing ./src with./lib. These can be run using “node cmd”. Versions of the utilities can be run directly from the (native) command line using the files found in ./fs/usr/bin. Various tests can be found in ./test. Both the syscalls and bindings can be found in ./src/browser-node directory in syscall.ts and the binding subdir.

To enter into interactive debugging, open ./src/kernel/kernel.ts, and change the following line from:
let DEBUG = false;
to:
let DEBUG = true;
Run the tests and use chrome’s debugging tools.

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
