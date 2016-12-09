MAIN = hello-world-http

all: $(MAIN).js

$(MAIN).js:
#	rm ~/pkg/linux_js -r
	browsix-gopherjs build
	cp hello-world-http.js ../../fs/usr/bin/go-hello

.PHONY: $(MAIN).js
