package main

import (
	"bytes"
	"image"
	_ "image/jpeg"
	"image/png"
	"log"
	"math"
	"net/http"
	"strings"

	"github.com/fogleman/gg"
	"github.com/nfnt/resize"
	"golang.org/x/image/font"
)

type Handler struct {
	// these are read only, safe for access from multiple goroutines
	images map[string]image.Image
	font   font.Face
}

func NewHandler(images map[string]image.Image, font font.Face) *Handler {
	return &Handler{images, font}
}

const imgW, imgH = 640, 480

// adapted from example/meme.go
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

	dc := gg.NewContext(imgW, imgH)
	dc.DrawImage(bgImg, 0, 0)

	dc.SetFontFace(h.font)

	drawString := func(s string, baseY float64) {
		dc.SetRGB(0, 0, 0)
		n := 6 // "stroke" size
		for dy := -n; dy <= n; dy++ {
			for dx := -n; dx <= n; dx++ {
				if dx*dx+dy*dy >= n*n {
					// give it rounded corners
					continue
				}
				x := imgW/2 + float64(dx)
				y := baseY + float64(dy)
				dc.DrawStringAnchored(s, x, y, 0.5, 0.5)
			}
		}
		dc.SetRGB(1, 1, 1)
		dc.DrawStringAnchored(s, imgW/2, baseY, 0.5, 0.5)
	}

	drawString(top, float64(int(math.Ceil(*size**dpi/72))-20))
	drawString(bottom, imgH-30)

	b := bytes.Buffer{}
	err := png.Encode(&b, dc.Image())
	if err != nil {
		log.Printf("png.Encode: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "image/png")
	rw.Write(b.Bytes())
}
