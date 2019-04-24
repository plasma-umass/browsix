We need Browsix-WASM's `emscripten` and Browsix-SPEC to execute SPEC CPU 2006 and 2017 Benchmarks. Browsix-WASM `emscripten` is available in `browsix-wasm` branch of [Browsix-Emscripten](https://github.com/plasma-umass/browsix-emscripten).

In below steps we will compile `bzip2` benchmark to WebAssembly and execute it with `ref` size of data set. To compile and execute other benchmarks with `ref` or `test` size of dataset, repeat the below procedure.

## Using Emscripten
To use Emscripten 1.37.22, we need binaryen tools and `fastcomp` 1.37.22. The process to build `fastcomp` 1.37.22 is similar to the instructions mentioned on [here](https://emscripten.org/docs/building_from_source/building_fastcomp_manually_from_source.html).

1. Follow instructions on [here](https://webassembly.org/getting-started/developers-guide/) to install the latest `emsdk`. 
2. Clone `fastcomp` and clang and change the directory to `fastcomp-1.37.22`.
```
git clone https://github.com/emscripten-core/emscripten-fastcomp
cd emsripten-fastcomp
git clone https://github.com/emscripten-core/emscripten-fastcomp-clang tools/clang
cd ..
mv emscripten-fastcomp fastcomp-1.37.22
```
3. Checkout version 1.37.22.
```
cd fastcomp-1.37.22
git checkout 1.37.22
cd tools/clang
git checkout 1.37.22
cd ../..
``` 
5. Create a `build` directory and cd into it.
```
mkdir build
cd build
```
6. Configure and make
```
cmake .. -DCMAKE_BUILD_TYPE=Release -DLLVM_TARGETS_TO_BUILD="host;JSBackend" -DLLVM_INCLUDE_EXAMPLES=OFF -DLLVM_INCLUDE_TESTS=OFF -DCLANG_INCLUDE_TESTS=OFF
make -j4
```
7. Open `~/.emscripten` file and set `LLVM_ROOT` to the absolute path of `fastcomp-1.37.22/build/bin` directory.
8. Clone `emscripten` from https://github.com/plasma-umass/browsix-emscripten.git to `emscripten` or extract `emscripten.tar.xz` to `emscripten`.
9. `cd emscripten` and execute `./emcc -v` to run sanity checks. If there any errors (which are usually in red color), then double check the process.

Now we can use emscripten's C compiler `emcc` and C++ compiler `em++` to compile C and C++ to WebAssembly or asm.js using Browsix-WASM. 

## Compiling SPEC CPU2006 Benchmarks

1. Install SPEC CPU2006 Benchmarks. All instructions __require__ that SPEC CPU2006 suite has been installed in `/spec-cpu2006/`.
2. Set the values of `CC` and `CXX` variables in `browsix-asmjs.cfg` and `browsix-wasm.cfg` to absolute paths of `emcc` and `em++`. 
3. Copy `browsix-asmjs.cfg` and `browsix-wasm.cfg` to `/spec-cpu2006/config`.
4. Compile `401.bzip2` benchmark to WebAssembly with `ref` dataset
```
cd /spec
. ./shrc
runspec --size=ref --tune=base --config=browsix-wasm.cfg --noreportable --iterations=1 401.bzip2
```
5. We can ignore the errors spec scripts throws when it executes the benchmarks compiled binaries. However, there should be __no__ compilation error.
6. Similarly, to compile to asm.js execute above command but with `--config=browsix-asmjs.cfg`.
7. A `build` directory will be created in `/spec-cpu2006/benchspec/CPU2006/401.bzip2/build/build_base_browsix-wasm.xxxx/` and similarly for asm.js. In both cases, `bzip2.js` contains compiled asm.js and WebAssembly code for 401.bzip2.
8. A `run` directory will be created in `/spec-cpu2006/benchspec/CPU2006/401.bzip2/run/run_base_ref_browsix-wasm.0000`, that contains input files and `speccmds.cmd` describing the commands for `specinvoke` to execute.

## Browsix-SPEC with Browsix-WASM Kernel installation
1. Install NodeJS 8.5 (or later). The latest 8.x release can be found [here](https://nodejs.org/dist/latest-v8.x/). Notice that `emsdk` provides `nodejs 8.12.0` by default.
2. Install Linux Kernel's `perf` utility on Ubuntu using
```
sudo apt-get install linux-tools-generic linux-tools-`uname -r`
```
Or on Fedora/RedHat using
```
sudo dnf install perf
```
2. Clone this repo to `browsix-spec2006` directory.

3. Build Browsix by
```
make serve
```
4. Build Browsix-SPEC by
```
make browsix-spec
```

## Adding Benchmarks to Browsix-SPEC
Now we copy compiled binaries of SPEC benchmarks and `run` directory to the corresponding Browsix-SPEC directory in `browsix-spec2006`.
1. Following commands to copy all run files (assuming your current directory is `browsix-spec2006`). Unfortunately, currently both WebAssembly and asm.js files has to reside in `run_base_<data_size>_browsix-asmjs.0000` directory.
```
mkdir -p fs/spec/cpu2006_asmjs/benchspec/CPU2006/401.bzip2/run/run_base_ref_browsix-asmjs.0000
cp /spec-cpu2006/benchspec/CPU2006/401.bzip2/run/run_base_ref_browsix-wasm.0000/* fs/spec/cpu2006_asmjs/benchspec/CPU2006/401.bzip2/run/run_base_ref_browsix-asmjs.0000/
```
To copy files for asm.js, replace `run_base_ref_browsix-wasm.0000` with `run_base_ref_browsix-asmjs.0000`.
3. Change file paths to correct file paths in Browsix-SPEC's filesystem in `speccmds.cmd`.
```
cd fs/spec/cpu2006_asmjs/benchspec/CPU2006/401.bzip2/run/run_base_ref_browsix-asmjs.0000/
sed 's/\/spec-cpu2006\/benchspec/\/spec\/cpu2006_asmjs\/benchspec/g' speccmds.cmd > speccmds.cmd-2
sed 's/\/run_base_ref_browsix-wasm.0000/\/run_base_ref_browsix-asmjs.0000/g' speccmds.cmd-2 > speccmds.cmd
cd ../../../../../../../../
```

4. Copy executable file(s), i.e. `bzip2.js`.
```
cp /spec-cpu2006/benchspec/CPU2006/401.bzip2/build/build_base_browsix-wasm.0000/bzip2.js fs/spec/cpu2006_asmjs/benchspec/CPU2006/401.bzip2/run/run_base_ref_browsix-asmjs.0000/bzip2_base.browsix-wasm
```
To copy `bzip2.js` for asm.js, replace `run_base_ref_browsix-wasm.0000` with `run_base_ref_browsix-asmjs.0000`.
5. Build `specinvoke` binary provided by SPEC CPU2006 Benchmarks using Emscripten and copy that binary to `browsix-spec2006/fs/usr/bin`.
6. Update Browsix-WASM's filesystem index.
```
./xhrfs-index fs > fs/index.json
```

## Execute Benchmarks
1. Execute Browsix-SPEC's server that finds the process executing the benchmark in the browser and attach `perf` to it.
```
cd browsix-spec2006
sudo node spec_server.js
```
2. To enable SharedArrayBuffer in Chrome go to `chrome://flags` and enable `Experimental enabled SharedArrayBuffer support in JavaScript.` and in Firefox go to `about:config` and enable `javascript.options.shared_memory`.
3. To execute the benchmark in Firefox, open Firefox in command line using `firefox -contentproc=2` and to execute the benchmark in Chrome open Chrome in command line using `google-chrome-stable`.
4. To execute `bzip2` with `ref` dataset, navigate to ` http://localhost:9000/?size=ref&benchmark=bzip2`.
5. We can use Web Console/Browser Console in Firefox and Developer Tools -> Console in Chrome to see the progress of each benchmark.
6. When the benchmark is finished, download the resulting tar file that contains the output of the benchmark, `speccmds.out`, `speccmds.err` etc. files.
7. Data collected by perf is in `browsix-spec2006/perf_data`.
