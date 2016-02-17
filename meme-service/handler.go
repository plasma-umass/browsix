package main

import (
	"bytes"
	"image"
	"image/draw"
	_ "image/jpeg"
	"image/png"
	"log"
	"math"
	"net/http"
	"strings"

	"github.com/golang/freetype/truetype"
	"github.com/nfnt/resize"
	"golang.org/x/image/font"
	"golang.org/x/image/math/fixed"
)

type Handler struct {
	// these are read only, safe for access from multiple goroutines
	images map[string]image.Image
	font   *truetype.Font
}

func NewHandler(images map[string]image.Image, font *truetype.Font) *Handler {
	return &Handler{images, font}
}

const imgW, imgH = 640, 480

func (h *Handler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	bgName := strings.Split(req.URL.Path, "/")[0]

	q := req.URL.Query()
	top := q.Get("top")
	bottom := q.Get("bottom")

	if top == "" && bottom == "" {
		top = "Can't think of a demo?"
		bottom = "Why not Zoidberg?"
	}

	bgImg, ok := h.images[bgName]
	if !ok {
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	log.Printf("%s: \"%s\", \"%s\"", req.URL.Path, top, bottom)

	// resize to match our output dimensions
	bgImg = resize.Resize(imgW, imgH, bgImg, resize.Lanczos3)

	fg := image.Black
	rgba := image.NewRGBA(image.Rect(0, 0, imgW, imgH))
	draw.Draw(rgba, rgba.Bounds(), bgImg, image.ZP, draw.Src)

	d := &font.Drawer{
		Dst: rgba,
		Src: fg,
		Face: truetype.NewFace(h.font, &truetype.Options{
			Size:    *size,
			DPI:     *dpi,
			Hinting: font.HintingFull,
		}),
	}
	y := 10 + int(math.Ceil(*size**dpi/72))
	//dy := int(math.Ceil(*size * *spacing * *dpi / 72))
	d.Dot = fixed.Point26_6{
		X: (fixed.I(imgW) - d.MeasureString(top)) / 2,
		Y: fixed.I(y),
	}
	d.DrawString(top)
	//y += dy

	y = imgH - 15
	d.Dot = fixed.Point26_6{
		X: (fixed.I(imgW) - d.MeasureString(bottom)) / 2,
		Y: fixed.I(y),
	}
	d.DrawString(bottom)

	b := bytes.Buffer{}
	err := png.Encode(&b, rgba)
	if err != nil {
		log.Printf("png.Encode: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "image/png")
	rw.Write(b.Bytes())
}
