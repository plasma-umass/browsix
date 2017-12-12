package main

import (
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"os"
)

func main() {
	router := gin.Default()

	file1, _ := os.Open("/usr/bin/big1.txt")
	file2, _ := os.Open("/usr/bin/big2.txt")
	file3, _ := os.Open("/usr/bin/big3.txt")
	file4, _ := os.Open("/usr/bin/big4.txt")
	file5, _ := os.Open("/usr/bin/big5.txt")

	/*
	file1, _ := os.Open("big1.txt")
	file2, _ := os.Open("big2.txt")
	file3, _ := os.Open("big3.txt")
	file4, _ := os.Open("big4.txt")
	file5, _ := os.Open("big5.txt")
	*/

	defer file1.Close()
	defer file2.Close()
	defer file3.Close()
	defer file4.Close()
	defer file5.Close()

	b1, _ := ioutil.ReadAll(file1)
	b2, _ := ioutil.ReadAll(file2)
	b3, _ := ioutil.ReadAll(file3)
	b4, _ := ioutil.ReadAll(file4)
	b5, _ := ioutil.ReadAll(file5)

	fileString1 := string(b1)
	fileString2 := string(b2)
	fileString3 := string(b3)
	fileString4 := string(b4)
	fileString5 := string(b5)

	router.GET("/big1", func(c *gin.Context) {
		c.String(200, fileString1)
	})

	router.GET("/big2", func(c *gin.Context) {
		c.String(200, fileString2)
	})

	router.GET("/big3", func(c *gin.Context) {
		c.String(200, fileString3)
	})

	router.GET("/big4", func(c *gin.Context) {
		c.String(200, fileString4)
	})

	router.GET("/big5", func(c *gin.Context) {
		c.String(200, fileString5)
	})

	router.GET("/test", func(c *gin.Context) {
		c.String(200, "this is a test\n")
	})

	router.Run("128.0.0.1:8080")
}
