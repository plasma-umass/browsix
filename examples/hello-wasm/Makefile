hello: hello.c
	emcc -O2 -g3 -o hello hello.c -s BINARYEN=1 -s "BINARYEN_METHOD='native-wasm'"

clean:
	rm -f hello hello.js

.PHONY: hello clean
