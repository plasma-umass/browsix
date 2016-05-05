package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	_ "image/jpeg"
	"image/png"
	"log"
	"math"
	"net/http"
	"strings"

	"github.com/fogleman/gg"
	"golang.org/x/image/font"
)

const imgW, imgH = 640, 480

type Handler struct {
	img  *ImageCache
	font font.Face
}

func NewHandler(ic *ImageCache, font font.Face) *Handler {
	return &Handler{ic, font}
}

type requestKind int

type req interface {
	Serve(rw http.ResponseWriter)
}

type listRequest struct {
	lst []map[string]string
}

func (req listRequest) Serve(rw http.ResponseWriter) {

	bytes, err := json.Marshal(req.lst)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		log.Printf("marshal error: %s", err)
		return
	}

	rw.Write(bytes)
}

type origRequest struct {
	mime string
	data []byte
}

func (req origRequest) Serve(rw http.ResponseWriter) {
	rw.Header().Set("Content-Type", req.mime)
	rw.Write(req.data)
}

type memeRequest struct {
	h      *Handler
	meme   string
	top    string
	bottom string
}

func (req memeRequest) Serve(rw http.ResponseWriter) {
	bgImg, err := req.h.img.Get(req.meme, imgW, imgH)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		log.Printf("Get('%s'): %s", req.meme, err)
		return
	}

	log.Printf("%s: \"%s\", \"%s\"", req.meme, req.top, req.bottom)

	dc := gg.NewContext(imgW, imgH)
	dc.DrawImage(bgImg, 0, 0)

	dc.SetFontFace(req.h.font)

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

	drawString(req.top, float64(int(math.Ceil(*size**dpi/72))-20))
	drawString(req.bottom, imgH-30)

	b := bytes.Buffer{}
	err = png.Encode(&b, dc.Image())
	if err != nil {
		log.Printf("png.Encode: %s", err)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "image/png")
	rw.Write(b.Bytes())
}

type invalidRequest struct {
	err error
}

func (req invalidRequest) Serve(rw http.ResponseWriter) {
	rw.WriteHeader(http.StatusBadRequest)
	fmt.Fprintf(rw, "%s", req.err)
}

func (h *Handler) request(req *http.Request) req {

	parts := strings.Split(req.URL.Path, "/")
	// deal with trailing /
	if len(parts) > 0 && parts[len(parts)-1] == "" {
		parts = parts[:len(parts)-1]
	}

	switch len(parts) {
	case 0:
		return invalidRequest{fmt.Errorf("must specify a subresource")}
	case 1:
		if parts[0] != "memes" {
			return invalidRequest{
				fmt.Errorf("unknown resource '%s'", parts[0]),
			}
		}
		return listRequest{h.img.List()}
	default:
		if len(parts) > 2 && parts[2] == "orig" {
			bgData := h.img.Orig(parts[1])
			if bgData == nil {
				return invalidRequest{
					fmt.Errorf("unknown resource '%s'", parts[1]),
				}
			}
			return origRequest{bgData.mime, bgData.data}
		}

		meme := parts[1]
		q := req.URL.Query()
		top := q.Get("top")
		bottom := q.Get("bottom")

		if top == "" && bottom == "" {
			top = "Can't think of a demo?"
			bottom = "Why not Zoidberg?"
		}

		return memeRequest{h, meme, top, bottom}
	}
}

// adapted from example/meme.go
func (h *Handler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	h.request(req).Serve(rw)
}
