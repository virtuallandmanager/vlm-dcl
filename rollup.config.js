import resolve from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import packageJson from "./package.json";

export default {
  input: "src/index.ts",
  context: "globalThis",
  external: [/@dcl\//, /@decentraland\//],
  output: [
    {
      exports: "named",
      file: packageJson.main,
      format: "amd",
      amd: {
        id: packageJson.name,
      },
    },
  ],
  plugins: [
    resolve({
      preferBuiltins: false,
      browser: true,
    }),
    replace({
      __VERSION__: JSON.stringify(require('./package.json').version),
      preventAssignment: true
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: false,
      compilerOptions: {
        sourceMap: false,
        inlineSourceMap: false,
        inlineSources: false,
      },
    }),
    commonjs({
      exclude: "node_modules",
      ignoreGlobal: true,
    }),
    terser({ format: { comments: false } }),
  ],
};
