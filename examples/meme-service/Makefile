MAIN = meme-service

all: $(MAIN).js

$(MAIN).js:
#	rm ~/pkg/linux_js -r
	gopherjs build
	cp $(MAIN).js ../../../meme-frontend/fs/$(MAIN).js

.PHONY: $(MAIN).js
