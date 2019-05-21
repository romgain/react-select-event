import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import pkg from "./package.json";

export default [
  {
    input: "src/index.ts",
    external: ["dom-testing-library"],
    plugins: [
      resolve({ extensions: [".js", ".ts"] }),
      babel({ extensions: [".js", ".ts"] })
    ],
    output: [
      { file: pkg.main, format: "cjs", exports: "named" },
      { file: pkg.module, format: "es" }
    ]
  }
];
