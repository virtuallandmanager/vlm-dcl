import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript"; // Import the new plugin
import dts from "rollup-plugin-dts";

const PROD = !!process.env.CI;

export default [
  {
    input: "src/index.ts",
    external: (id) => {
      return /@dcl\/|@decentraland\//.test(id);
    },
    output: {
      file: "dist/bundle.min.js", // this will be the output bundle
      format: "esm", // output format
      sourcemap: true,
    },
    plugins: [
      resolve({
        mainFields: ["module", "main"],
        browser: true,
      }),
      commonjs(),
      typescript(),
      PROD && terser({ format: { comments: false } }),
    ],
  },
  // This configuration is for bundling the TypeScript declarations
  {
    input: "src/index.ts", // replace this with the entry point to your library
    output: {
      file: "dist/bundle.d.ts", // this will be the output declarations file
      format: "es", // always use 'es' for TypeScript declarations
    },
    plugins: [dts()],
  },
];