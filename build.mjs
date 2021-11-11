import { build } from 'esbuild';

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: 'dist',
  platform: 'node',
  target: 'node14',
  external: ['react', 'react-dom', 'styled-components']
});
