
BOWER     ?= node_modules/.bin/bower
GULP      ?= node_modules/.bin/gulp
TSLINT    ?= node_modules/.bin/tslint
MOCHA     ?= node_modules/.bin/mocha

TEX        = pdflatex

NPM_DEPS   = $(GULP) $(TSLINT) $(MOCHA)
BUILD_DEPS = $(NPM_DEPS) bower_components

SYSTEMGO   = github.com/rvolosatovs/systemgo
INIT	   = fs/usr/bin/init
SYSTEMCTL  = fs/usr/bin/systemctl

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

browsix-spec: $(BUILD_DEPS)
	@echo "  Browsix SPEC"
	$(GULP) browsix-spec

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

syscall-api: $(BUILD_DEPS)
	@echo "  SYSCALL"
	node_modules/.bin/gulp dist-syscall-api

bin: $(BUILD_DEPS)
	@echo "  BIN"
	node_modules/.bin/gulp index-fs

systemgo: init systemctl

init: $(BUILD_DEPS)
	@echo "  INIT"
	browsix-gopherjs build $(SYSTEMGO)/cmd/init -o $(INIT)
	rm $(INIT).map
	chmod +x $(INIT)

systemctl: $(BUILD_DEPS)
	@echo "  SYSTEMCTL"
	browsix-gopherjs build $(SYSTEMGO)/cmd/systemctl -o $(SYSTEMCTL)
	rm $(SYSTEMCTL).map
	chmod +x $(SYSTEMCTL)

test-browser: $(BUILD_DEPS)
	@echo "  TEST BROWSER"
	$(GULP) test-browser

test: test-browser

clean:
	rm -rf dist lib lib-dist fs report.{pdf,aux,bbl,blg,log} test/*.js
	find . -name '*~' | xargs rm -f

distclean: clean
	rm -rf node_modules bower_components

.PHONY: all clean distclean test test-browser test-node report test-once shell serve init systemctl
