// Copyright 2015 The Freetype-Go Authors. All rights reserved.
// Use of this source code is governed by your choice of either the
// FreeType License or the GNU General Public License version 2 (or
// any later version), both of which can be found in the LICENSE file.

package main

import (
	"bytes"
	"flag"
	"fmt"
	"image"
	"io/ioutil"
	"log"
	"net/http"
	"path"

	"github.com/golang/freetype/truetype"
)

var (
	addr     = flag.String("addr", "127.0.0.1:8080", "address to listen on")
	dpi      = flag.Float64("dpi", 144, "screen resolution in Dots Per Inch")
	fontfile = flag.String("fontfile", "./font/leaguegothic-regular-webfont.ttf", "filename of the ttf font")
	size     = flag.Float64("size", 36, "font size in points")
	imgDir   = flag.String("bgdir", "./img", "directory where background images live")
)

var imageSuffixes = []string{
	".jpg",
	".png",
}

func isImage(p string) bool {
	ext := path.Ext(p)
	for _, suffix := range imageSuffixes {
		if ext == suffix {
			return true
		}
	}
	return false
}

func name(p string) string {
	p = path.Base(p)
	ext := path.Ext(p)
	return p[:len(p)-len(ext)]
}

/*
func readImages(dir string) (map[string][]byte, error) {
	images := map[string][]byte{}

	dents, err := ioutil.ReadDir(dir)
	if err != nil {
		return nil, fmt.Errorf("ReadDir(%s): %s", dir, err)
	}

	for _, dent := range dents {
		n := dent.Name()
		if dent.IsDir() || !isImage(n) {
			continue
		}
		b, err := ioutil.ReadFile(path.Join(dir, n))
		if err != nil {
			log.Printf("Readfile(%s): %s", n, err)
			// if one image can't be read, its not the end
			// of the world
			continue
		}

		// test decoding, but don't keep the result.  We will
		// decode per-request to minimize memory usage.
		_, _, err = image.Decode(bytes.NewReader(b))
		if err != nil {
			log.Printf("Decode(%s): %s", n, err)
			continue
		}

		images[name(n)] = b
	}

	if len(images) == 0 {
		return nil, fmt.Errorf("no images found in %s", dir)
	}

	return images, nil
}
*/

func readImages(dir string) (map[string]image.Image, error) {
	// FIXME: implement getdents
	n := "/zoidberg.jpg"

	images := map[string]image.Image{}

	b, err := ioutil.ReadFile(path.Join(dir, n))
	if err != nil {
		return nil, fmt.Errorf("Readfile(%s): %s", n, err)
	}

	// decode ahead of time, as it is expensive.
	img, _, err := image.Decode(bytes.NewReader(b))
	if err != nil {
		return nil, fmt.Errorf("Decode(%s): %s", n, err)
	}

	images[name(n)] = img

	return images, nil
}

func main() {
	flag.Parse()

	images, err := readImages(*imgDir)
	if err != nil {
		log.Fatalf("readImages: %s", err)
	}

	fontBytes, err := ioutil.ReadFile(*fontfile)
	if err != nil {
		log.Println(err)
		return
	}
	font, err := truetype.Parse(fontBytes)
	if err != nil {
		log.Println(err)
		return
	}

	http.Handle("/api/meme/v1/", http.StripPrefix("/api/meme/v1/", NewHandler(images, font)))
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "404 unknown url: %s\n", req.URL)
	})

	log.Printf("ready and listening on %s", *addr)
	// start http server
	err = http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Printf("ListenAndServe: %s", err)
	}
}
