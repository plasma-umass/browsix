Browsix - A Unix-like Operating System for the Browser
======================================================

Modern web applications are multi-process by nature - the client and
some of the application logic lives in the browser, and some of it
lives in the cloud, often implemented as
[microservices](https://en.wikipedia.org/wiki/Microservices).

Browsix lets you rethink the boundary between code executing in the
browser vs. server-side, while taking advantage of the multi-core
nature of modern computing devices.

With Browsix, you compose the in-browser part of your web applications
out of processes.  Processes behave as you would expect coming from
[Unix](https://en.wikipedia.org/wiki/Unix): they run in parallel with
the main browser thread, can communicate over pipes, sockets, or the
filesystem, and can create subprocesses.  This process model is
implemented on top of existing browser APIs, like [web
workers](https://en.wikipedia.org/wiki/Web_worker), so it works in all
modern browsers.

Using Browsix, you can run a large class of existing
[*node.js*](https://nodejs.org/) and [*Go*](https://golang.org/)
utilities and services in the browser without code changes and without
having to allocate server-side resources -- Browsix applications can
be served statically or by
[CDN](https://en.wikipedia.org/wiki/Content_delivery_network).

### The Browsix Shell

As a proof of concept, we've implemented a POSIX-like shell on top of
Browsix, along with an implementation of a number of standard Unix
utilities (`cat`, `tee`, `echo`, `sha1sum`, and friends).  The
utilities are all standard node programs that will run directly under
node, or in the browser under Browsix.  Individual commands are
executed in their own workers, and piping works as expected:

![shell](doc/img/shell.png)

Try it out here: [live demo!](https://unix.bpowers.net/)

### Details

Browsix currently supports running node.js and Go programs.  It
supports Go with a modified GopherJS compiler.


Using Browsix
-------------

There are two parts to Browsix: build-tooling and runtime support.

Get browsix through npm:

```
    $ npm install --save browsix
```


Building & Testing
------------------

Browsix has four simple dependencies: `git`, `node.js` 4.3 or above
(0.12 might work, but 0.10 won't), `npm` (usually installed along with
node), and `make`, and builds on OSX and Linux systems.  Once you have
those dependencies:

```
    $ git clone https://github.com/plasma-umass/browsix
    $ cd browsix
    $ make test-once serve
```

This will pull the dependencies, build the runtime and all the
utilities, run a number of tests in either Firefox or Chrome, and then
launch a copy of the shell served locally.


Contributing
------------

You're interested in contributing?  That's great!

The process is similar to other open-source projects hosted on github:

* Fork the repository
* Make some changes
* Commit your changes with a descriptive commit message
* Open a pull request


Contact
-------

If you have questions or problems, please [open an
issue](https://github.com/plasma-umass/browsix/issues) on this
repository (plasma-umass/browsix).


Open Source
-----------

This project is licensed under the MIT license, but also incorporates
code from other sources.

Browsix uses [BrowserFS](https://github.com/jvilk/BrowserFS) for its
filesystem, which is [primarily MIT licensed](LICENSE.browserfs).

browser-node's [`nextTick`](src/browser-node/browser-node.ts#L114)
implementation comes from the
[acorn](https://github.com/marijnh/acorn) project, released under [the
MIT license](LICENSE.acorn).

A large portion of browser-node is the
[node](https://github.com/nodejs/node) standard library, which is [MIT
licensed](LICENSE.node).

Functions to convert buffers to utf-8 strings and back are derivative
of
[browserify](https://github.com/substack/node-browserify/blob/master/LICENSE)
implementations (ported to TypeScript), [MIT
licensed](LICENSE.browserify) as well.
