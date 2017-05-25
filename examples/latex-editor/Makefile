
BOWER     ?= node_modules/.bin/bower
GULP      ?= node_modules/.bin/gulp

NPM_DEPS   = $(GULP)
BUILD_DEPS = $(NPM_DEPS) bower_components


# quiet output, but allow us to look at what commands are being
# executed by passing 'V=1' to make, without requiring temporarily
# editing the Makefile.
ifneq ($V, 1)
MAKEFLAGS += -s
endif

# GNU make, you are the worst.
.SUFFIXES:
%: %,v
%: RCS/%,v
%: RCS/%
%: s.%
%: SCCS/s.%
.SUFFIXES: .tex .pdf

all: serve

serve: $(BUILD_DEPS)
	@echo "  SERVE"
	$(GULP) serve

node_modules: bower_components package.json
	@echo "  NPM"
	npm install
	touch -c $@

$(BOWER):
	@echo "  NPM bower"
	npm install bower
	touch -c $@

$(NPM_DEPS): node_modules
	touch -c $@

bower_components: $(BOWER) bower.json
	@echo "  BOWER"
	$(BOWER) install --silent
	touch -c $@

clean:
	rm -rf dist
	find . -name '*~' | xargs rm -f

distclean: clean
	rm -rf node_modules bower_components

.PHONY: all clean distclean serve
