package main

import (
	"fmt"
	"html"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from go: %q\n", html.EscapeString(r.URL.Path))
		// after we've responded once, get outta town
		go func() {
			time.Sleep(1 * time.Second)
			os.Exit(0)
		}()
	})

	log.Fatal(http.ListenAndServe("127.0.0.1:8080", nil))
}
