MAIN = hello-world

all: $(MAIN).js

$(MAIN).js:
#	rm ~/pkg/linux_js -r
	gopherjs build
	cp $(MAIN).js ../fs/usr/bin/hello-from-go

.PHONY: $(MAIN).js
