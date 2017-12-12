package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path"

	"github.com/gin-gonic/gin"
)

var (
	addr   = flag.String("addr", "128.0.0.1:80", "address to listen on")
	prefix = flag.String("prefix", "/srv", "large file location")
)

func read(filename string) string {
	fullPath := path.Join(*prefix, filename)

	f, err := os.Open(fullPath)
	if err != nil {
		panic(fmt.Errorf("Open(%s): %s", fullPath, err))
	}
	defer f.Close()

	contents, err := ioutil.ReadAll(f)
	if err != nil {
		panic(fmt.Errorf("ReadAll(%s): %s", fullPath, err))
	}

	return string(contents)
}

func main() {
	flag.Parse()

	router := gin.Default()

	contents1 := read("big1.txt")
	contents2 := read("big2.txt")
	contents3 := read("big3.txt")
	contents4 := read("big4.txt")
	contents5 := read("big5.txt")

	router.GET("/big1", func(c *gin.Context) {
		c.String(200, contents1)
	})

	router.GET("/big2", func(c *gin.Context) {
		c.String(200, contents2)
	})

	router.GET("/big3", func(c *gin.Context) {
		c.String(200, contents3)
	})

	router.GET("/big4", func(c *gin.Context) {
		c.String(200, contents4)
	})

	router.GET("/big5", func(c *gin.Context) {
		c.String(200, contents5)
	})

	router.GET("/test", func(c *gin.Context) {
		c.String(200, "this is a test\n")
	})

	router.Run(*addr)
}
