package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	if len(os.Args) != 2 {
		log.Fatalf("usage: %s FILE", os.Args[0])
	}

	fname := os.Args[1]

	fi, err := os.Stat(fname)
	if err != nil {
		log.Fatalf("Stat(%s): %s", fname, err)
	}

	fmt.Printf("%s: %#v\n", fname, fi)
}
