import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'lib/kernel/kernel.js',
  plugins: [
    resolve(),
    commonjs(),
  ],
  output: {
    name: 'kernel',
    format: 'umd',
    file: 'lib-dist/kernel/kernel.js',
    exports: 'named',
  },
};
