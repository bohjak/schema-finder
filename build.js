// @ts-check
import {build, analyzeMetafile} from "esbuild";
import {performance} from "perf_hooks";

const start = performance.now();
build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: "dist",
  platform: "node",
  target: "node14",
  format: "esm",
  external: ["react", "react-dom", "styled-components"],
  metafile: true,
})
  .then(({metafile}) => analyzeMetafile(metafile))
  .then(console.log)
  .catch(() => process.exit(1))
  .finally(() =>
    console.log(`⚡  Built in ${Math.round(performance.now() - start)}ms.`)
  );
