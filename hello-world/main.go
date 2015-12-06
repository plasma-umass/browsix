package main

import (
	"fmt"
	"os"
)

func greetingGenerator(ch chan string) {
	for {
		ch <- "Hello, 世界"
	}
}

func main() {
	ch := make(chan string)
	go greetingGenerator(ch)

	fmt.Println(<-ch)

	os.Exit(0)
}
