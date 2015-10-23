Dev instructions
----------------

1. Have node installed
2. `$ make serve` will take care of the rest.

If you open a console, you should see messages from both the
web-worker and the 'kernel', and some timing information for how long
roundtrips take.


Unit tests
----------

Tests have been run and pass under:
- Safari 9.0.1 (Mac)
- Firefox 41.0.2 (Linux)
- Chrome 47.0.2526 (Linux)
- Chrome 46.0.2490 (Windows 10)
- Edge 12.10240.0 (Windows 10)

Open Source
-----------

This projets incorporates code from several sources.  node's nextTick
functionality is provided by code from the
[acorn](https://github.com/marijnh/acorn) project, released under the
MIT license.  A large portion of the
[node](https://github.com/nodejs/node) standard library is used.  Node
itself incorporates several projects, and the relevant licenses can be
found [here](https://github.com/nodejs/node/blob/master/LICENSE).