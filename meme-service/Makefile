MAIN = image

all: $(MAIN).js

$(MAIN).js:
#	rm ~/pkg/linux_js -r
	gopherjs build
	cp $(MAIN).js ../fs/usr/bin/go-write-image

.PHONY: $(MAIN).js
