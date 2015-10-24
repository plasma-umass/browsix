
BOWER     ?= node_modules/.bin/bower
GULP      ?= node_modules/.bin/gulp
TSLINT    ?= node_modules/.bin/tslint
MOCHA     ?= node_modules/.bin/mocha

TEX        = pdflatex

BROWSERFS  = src/kernel/vendor/BrowserFS/dist/browserfs.js
BROWSERFS_DIR = src/kernel/vendor/BrowserFS

NPM_DEPS   = $(BOWER) $(GULP) $(TSLINT) $(MOCHA)
BUILD_DEPS = $(NPM_DEPS) $(BROWSERFS) bower_components

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

all: test-once

dist: $(BUILD_DEPS)
	@echo "  DIST"
	$(GULP) 'build:dist'

.tex.pdf: report.bib
	@echo "  LATEX $@"
	$(TEX) $<
	bibtex $(shell echo $< | cut -d '.' -f 1).aux
	$(TEX) $<
	$(TEX) $<


report: report.pdf

test-once: $(BUILD_DEPS)
	@echo "  TEST"
	$(GULP)

shell: serve

serve: $(BUILD_DEPS)
	@echo "  SERVE"
	$(GULP) serve

node_modules: package.json
	@echo "  NPM"
	npm install --silent
	touch -c $@

$(NPM_DEPS): node_modules
	touch -c $@

bower_components: $(BOWER) bower.json
	@echo "  BOWER"
	$(BOWER) install --silent
	touch -c $@

$(BROWSERFS): $(BROWSERFS_DIR) .gitmodules Makefile
	@echo "  GIT   $<"
	git submodule update --init
	touch $@

bin: $(BUILD_DEPS)
	@echo "  BIN"
	node_modules/.bin/gulp index-fs

test-browser: $(BUILD_DEPS)
	@echo "  TEST BROWSER"
	$(GULP) test-browser

test-node: $(BUILD_DEPS)
	@echo "  TEST NODE"
	$(GULP) test-node

test: test-browser

clean:
	rm -rf dist lib fs report.{pdf,aux,bbl,blg,log}
	find . -name '*~' | xargs rm -f

distclean: clean
	rm -rf node_modules bower_components

.PHONY: all clean distclean test test-browser test-node report test-once shell serve
