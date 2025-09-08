import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

export default [
    // JS 构建配置
    {
        input: "src/index.js", // 如果不用 TypeScript 改成 index.js
        output: [
            {
                file: "dist/index.cjs.js",
                format: "cjs",
                sourcemap: true,
            },
            {
                file: "dist/index.esm.js",
                format: "es",
                sourcemap: true,
            },
        ],
        plugins: [resolve(), commonjs(), typescript(), terser()],
    },
    // 类型声明文件
    {
        input: "src/index.js",
        output: [{ file: "dist/index.d.ts", format: "es" }],
        plugins: [dts()],
    },
];
