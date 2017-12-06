package main

import (
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"fmt"
	"os"
)

func main() {
	router := gin.Default()

    file, err1 := os.Open("/usr/bin/big.txt")
	
	if err1 != nil {
        fmt.Fprintf(os.Stderr, "ERR: %s\n\n", err1)
    }
    defer file.Close()

    b, err := ioutil.ReadAll(file)

	if err != nil {
		fmt.Fprintf(os.Stderr, "ERR: %s\n\n", err)
	}

	fileString := string(b)
	router.GET("/big", func(c *gin.Context) {
		c.String(200, fileString)
	})

	router.GET("/test", func(c *gin.Context) {
		c.String(200, "this is a test\n")
	})


	router.Run("128.0.0.1:8080")
}
