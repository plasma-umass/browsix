TEX        = pdflatex -halt-on-error -interaction nonstopmode
BIBTEX     = bibtex
MAIN       = main
TEX_FLAGS  = -halt-on-error -interaction nonstopmode --shell-escape


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

all: paper

%.pdf: %.tex $(wildcard *.bib) Makefile
	@echo "  LATEX $@"
	$(TEX) $(TEX_FLAGS) $<
	$(BIBTEX) $(patsubst %.tex,%.aux,$<)
	$(TEX) $(TEX_FLAGS) $<
	$(TEX) $(TEX_FLAGS) $<

paper: $(MAIN).pdf

.PHONY: all paper
