#!/bin/env node

// @ts-check
import {build, analyzeMetafile} from "esbuild";
import {performance} from "perf_hooks";

const start = performance.now();

const options = {};
for (const arg of process.argv.slice(2)) {
  switch (arg) {
    case "-watch":
      options.watch = true;
      break;
    case "-dev":
      options.dev = true;
      break;
  }
}

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: !options.dev,
  sourcemap: true,
  outdir: "dist",
  platform: "node",
  target: "node12",
  external: ["react", "react-dom", "styled-components"],
  metafile: true,
  watch: options.watch,
})
  .then(({metafile}) => analyzeMetafile(metafile))
  .then(console.log)
  .catch(() => process.exit(1))
  .finally(() =>
    console.log(`⚡  Built in ${Math.round(performance.now() - start)}ms.`)
  );
