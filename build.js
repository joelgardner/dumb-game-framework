import { build } from "esbuild";
import dts from "npm-dts";
import packagejson from "./package.json" assert { type: "json" };

build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  bundle: true,
  external: Object.keys(packagejson.dependencies),
});

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  external: Object.keys(packagejson.dependencies),
  outfile: "dist/index.esm.js",
  format: "esm",
});

new dts.Generator({
  entry: "src/index.ts",
  output: "dist/index.d.ts",
  logLevel: "error",
}).generate();
