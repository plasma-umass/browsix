// Copyright 2016 Bobby Powers, portions copyright Michael Fogleman.

package main

import (
	"flag"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/golang/freetype/truetype"
	"golang.org/x/image/font"
)

var (
	addr     = flag.String("addr", "127.0.0.1:8014", "address to listen on")
	dpi      = flag.Float64("dpi", 144, "screen resolution in Dots Per Inch")
	fontfile = flag.String("fontfile", "./static/fs/font/impact.ttf", "filename of the ttf font")
	size     = flag.Float64("size", 48, "font size in points")
	imgDir   = flag.String("bgdir", "./static/fs/img", "directory where background images live")
)

// from fogleman/gg
func loadFontFace(path string, points float64) (font.Face, error) {
	fontBytes, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	f, err := truetype.Parse(fontBytes)
	if err != nil {
		return nil, err
	}
	face := truetype.NewFace(f, &truetype.Options{
		Size:    points,
		Hinting: font.HintingFull,
	})
	return face, nil
}

func main() {
	flag.Parse()

	ic := NewImageCache(*imgDir)

	font, err := loadFontFace(*fontfile, *size)
	if err != nil {
		log.Println(err)
		return
	}

	http.Handle("/api/v1/", http.StripPrefix("/api/v1/", NewHandler(ic, font)))
	http.Handle("/", http.FileServer(http.Dir("./static")))

	log.Printf("ready and listening on %s", *addr)
	// start http server
	err = http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Printf("ListenAndServe: %s", err)
	}
}
