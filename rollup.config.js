import fs from 'fs'
import path from 'path'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const jsonPath = path.resolve(__dirname, './package.json')
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

const isProduction = process.env.NODE_ENV === 'production'
export default {
  input: 'src/index.ts',
  context: 'globalThis',
  external: (id) => /~system\//.test(id) || /@dcl\//.test(id),
  output: [
    {
      exports: 'named',
      file: jsonData.main,
      format: 'es',
    },
  ],
  plugins: [
    replace({
      __VERSION__: JSON.stringify(jsonData.version),
      preventAssignment: true,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: false,
      compilerOptions: {
        sourceMap: false,
        inlineSourceMap: false,
        inlineSources: false,
      },
    }),
    commonjs({
      ignoreGlobal: false,
    }),
    resolve({
      preferBuiltins: true,
      platform: 'node'
    }),
    isProduction && terser({ format: { comments: false } }),
  ].filter(Boolean), // This filters out the falsy values from the array
}
