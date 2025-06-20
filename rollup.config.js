import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser'
const pkg = require('./package.json');

export default [
  // ESM and CommonJS builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        sourcemap: true,
        exports: 'named',
        name: 'EncolaValidator'
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        inlineSources: true
      }),
      terser(),
    ],
  },
  // TypeScript declaration file
  {
    input: 'dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];