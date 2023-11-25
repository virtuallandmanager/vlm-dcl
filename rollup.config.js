import replace from '@rollup/plugin-replace';
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import packageJson from "./package.json";

const isProduction = process.env.NODE_ENV === 'production';
export default {
  input: "src/index.ts",
  context: "globalThis",
  // external: id => /@dcl\//.test(id),
  output: [
    {
      exports: "named",
      file: packageJson.main,
      format: "es",
    },
  ],
  plugins: [
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
      ignoreGlobal: false,
    }),
    isProduction && terser({ format: { comments: false } }),
  ].filter(Boolean),  // This filters out the falsy values from the array
};
