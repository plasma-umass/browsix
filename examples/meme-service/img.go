// Copyright 2016 Bobby Powers, portions copyright Michael Fogleman.

package main

import (
	"bytes"
	"fmt"
	"image"
	"io/ioutil"
	"log"
	"mime"
	"path"

	"github.com/nfnt/resize"
)

var imageSuffixes = []string{
	".jpg",
	".png",
}

type background struct {
	name  string
	mime  string
	bytes []byte
	img   image.Image
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

func readImages(dir string) (map[string]background, error) {
	images := map[string]background{}

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
		img, _, err := image.Decode(bytes.NewReader(b))
		if err != nil {
			log.Printf("Decode(%s): %s", n, err)
			continue
		}

		log.Printf("%s: (%s) %s", name(n), path.Ext(n), mime.TypeByExtension(path.Ext(n)))
		images[name(n)] = background{
			name:  name(n),
			mime:  mime.TypeByExtension(path.Ext(n)),
			bytes: b,
			img:   img,
		}
	}

	if len(images) == 0 {
		return nil, fmt.Errorf("no images found in %s", dir)
	}

	return images, nil
}

type OrigImage struct {
	mime string
	data []byte
}

type icBgRequest struct {
	resp   chan<- *image.Image
	name   string
	width  uint
	height uint
}

type icListRequest struct {
	resp chan<- []map[string]string
}

type icOrigRequest struct {
	resp chan<- *OrigImage
	name string
}

func (icBgRequest) req()   {}
func (icListRequest) req() {}
func (icOrigRequest) req() {}

type imageRequest interface {
	req()
}

type ImageCache struct {
	ch chan<- imageRequest
}

func NewImageCache(dir string) *ImageCache {

	ch := make(chan imageRequest)
	ic := &ImageCache{
		ch: ch,
	}

	go ic.cacheServer(dir, ch)

	return ic
}

func (ic *ImageCache) Orig(name string) *OrigImage {
	resp := make(chan *OrigImage)
	ic.ch <- icOrigRequest{
		resp: resp,
		name: name,
	}
	return <-resp
}

func (ic *ImageCache) List() []map[string]string {
	resp := make(chan []map[string]string)
	ic.ch <- icListRequest{
		resp: resp,
	}
	return <-resp
}

func (ic *ImageCache) Get(name string, width, height uint) (image.Image, error) {
	resp := make(chan *image.Image)
	ic.ch <- icBgRequest{
		resp:   resp,
		name:   name,
		width:  width,
		height: height,
	}
	img := <-resp
	if img == nil {
		return nil, fmt.Errorf("unable to get desired image '%s'", name)
	}

	return *img, nil
}

func cacheName(name string, width, height uint) string {
	return fmt.Sprintf("%s-%dx%d", name, width, height)
}

func (ic *ImageCache) cacheServer(dir string, requests <-chan imageRequest) {
	defer close(ic.ch)

	images, err := readImages(dir)
	if err != nil {
		log.Fatalf("readImages: %s", err)
	}

	sizedCache := map[string]image.Image{}

	getCached := func(name string, width, height uint) *image.Image {
		bg, ok := images[name]
		if !ok {
			return nil
		}
		cacheKey := cacheName(name, width, height)
		bgImg, ok := sizedCache[cacheKey]
		if !ok {
			// add missing image to cache
			// FIXME: this should take into account aspect ratio
			bgImg = resize.Resize(width, height, bg.img, resize.Lanczos3)
			sizedCache[cacheKey] = bgImg
		}
		return &bgImg
	}

	for {
		switch req := (<-requests).(type) {
		case icBgRequest:
			req.resp <- getCached(req.name, req.width, req.height)
		case icListRequest:
			lst := []map[string]string{}

			for _, img := range images {
				lst = append(lst, map[string]string{
					"name": img.name,
					"type": img.mime,
				})
			}
			req.resp <- lst
		case icOrigRequest:
			bg, ok := images[req.name]
			if !ok {
				req.resp <- nil
				continue
			}
			req.resp <- &OrigImage{bg.mime, bg.bytes}
		}
	}
}
