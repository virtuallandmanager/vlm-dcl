import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript"; // Import the new plugin

const PROD = !!process.env.CI;

export default {
  input: "src/index.ts",
  external: (id) => {
    return /@dcl\/|@decentraland\//.test(id);
  },
  output: {
    file: "./dist/index.js",
    format: "amd", // or your desired output format
    amd: {
      id: "vlm-dcl", // replace with your library name
    },
    sourcemap: true, // Add this line to enable source maps
    globals: {
      // Add any global dependencies here, if needed
      // Example:
      // 'dependency-name': 'GlobalDependencyName',
    },
  },
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json", // Update the path to point to the new tsconfig.json
    }),
    resolve({
      preferBuiltins: false,
      browser: true,
      extensions: [".mjs", ".js", ".jsx", ".json", ".node", ".ts", ".tsx"],
    }),
    commonjs(),
    babel({
      presets: ["@babel/preset-env", "@babel/preset-typescript"],
      plugins: [
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        ["@babel/plugin-proposal-class-properties", { loose: true }],
        ["@babel/plugin-transform-private-methods", { loose: true }],
        ["@babel/plugin-transform-private-property-in-object", { loose: true }],
      ],
      exclude: "node_modules/**", // Exclude node_modules to avoid potential problems
      babelHelpers: "bundled",
    }),
    terser({ format: { comments: false } }),
  ],
  onwarn: function (warning, warn) {
    if (warning.code !== "CIRCULAR_DEPENDENCY" && warning.code !== "THIS_IS_UNDEFINED") {
      warn(warning);
    }
  },
};
