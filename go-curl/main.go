package main

import (
	"net/http"
	"fmt"
	"flag"
	"os"
	"io"
)

func main() {
	flag.Parse()

	if flag.NArg() != 1 {
		fmt.Fprintf(os.Stderr, "1 required arg: URL\n")
		os.Exit(1)
	}

	url := flag.Arg(0)

	resp, err := http.Get(url)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Get(%s): %s", url, err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	n, err := io.Copy(os.Stdout, resp.Body)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Copy: %s", err)
	}
	fmt.Fprintf(os.Stderr, "copied %d bytes", n)

	os.Exit(0)
}
