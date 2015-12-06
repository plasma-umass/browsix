MAIN = hello-world-http

all: $(MAIN).js

$(MAIN).js:
#	rm ~/pkg/linux_js -r
	gopherjs build
	cp hello-world-http.js ../fs/usr/bin/go-hello

.PHONY: $(MAIN).js
