// Copyright 2015 The Freetype-Go Authors. All rights reserved.
// Use of this source code is governed by your choice of either the
// FreeType License or the GNU General Public License version 2 (or
// any later version), both of which can be found in the LICENSE file.

package main

import (
	"bufio"
	"bytes"
	"flag"
	"fmt"
	"image"
	"image/draw"
	_ "image/jpeg"
	"image/png"
	"io/ioutil"
	"log"
	"math"
	"os"

	"github.com/golang/freetype/truetype"
	"github.com/nfnt/resize"
	"golang.org/x/image/font"
	"golang.org/x/image/math/fixed"
)

var (
	dpi      = flag.Float64("dpi", 144, "screen resolution in Dots Per Inch")
	fontfile = flag.String("fontfile", "./font/leaguegothic-regular-webfont.ttf", "filename of the ttf font")
	size     = flag.Float64("size", 36, "font size in points")
	spacing  = flag.Float64("spacing", 1.5, "line spacing (e.g. 2 means double spaced)")
)

const bgImgSrc = "./img/Futurama-Zoidberg.jpg"

const top = "Can't think of a demo?"
const bottom = "Why not Zoidberg?"

const imgW, imgH = 640, 480

func main() {
	flag.Parse()

	// read-in images

	// read-in font

	// start http server

	// Read the font data.
	fontBytes, err := ioutil.ReadFile(*fontfile)
	if err != nil {
		log.Println(err)
		return
	}
	f, err := truetype.Parse(fontBytes)
	if err != nil {
		log.Println(err)
		return
	}

	bgImgBytes, err := ioutil.ReadFile(bgImgSrc)
	if err != nil {
		log.Println(err)
		return
	}

	bgImg, _, err := image.Decode(bytes.NewReader(bgImgBytes))
	if err != nil {
		log.Println(err)
		return
	}
	// resize to match our output dimensions
	bgImg = resize.Resize(imgW, imgH, bgImg, resize.Lanczos3)

	fg := image.Black
	rgba := image.NewRGBA(image.Rect(0, 0, imgW, imgH))
	draw.Draw(rgba, rgba.Bounds(), bgImg, image.ZP, draw.Src)

	h := font.HintingFull
	d := &font.Drawer{
		Dst: rgba,
		Src: fg,
		Face: truetype.NewFace(f, &truetype.Options{
			Size:    *size,
			DPI:     *dpi,
			Hinting: h,
		}),
	}
	y := 10 + int(math.Ceil(*size**dpi/72))
	dy := int(math.Ceil(*size * *spacing * *dpi / 72))
	d.Dot = fixed.Point26_6{
		X: (fixed.I(imgW) - d.MeasureString(top)) / 2,
		Y: fixed.I(y),
	}
	d.DrawString(top)
	y += dy

	y = imgH - 15
	d.Dot = fixed.Point26_6{
		X: (fixed.I(imgW) - d.MeasureString(bottom)) / 2,
		Y: fixed.I(y),
	}
	d.DrawString(bottom)

	//for _, s := range text {
	//	d.Dot = fixed.P(10, y)
	//	d.DrawString(s)
	//	y += dy
	//}

	// Save that RGBA image to disk.
	outFile, err := os.Create("out.png")
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	defer outFile.Close()
	b := bufio.NewWriter(outFile)
	err = png.Encode(b, rgba)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	err = b.Flush()
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	fmt.Println("Wrote out.png OK.")
	os.Exit(0)
}
