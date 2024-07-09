import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import preserveDirectives from "rollup-plugin-preserve-directives";
import pkg from "./package.json";

export default {
  input: "src/index.tsx", // or 'src/index.ts' if you use TypeScript
  output: [
    {
      dir: "dist",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript(),
    preserveDirectives(),
  ],
};
