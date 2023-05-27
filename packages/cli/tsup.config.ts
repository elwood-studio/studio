import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  treeshake: true,
  splitting: true,
  entry: ['src/**/*.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  minify: true,
  clean: true,
  external: [],
  legacyOutput: true,
  platform: 'node',
  tsconfig: './tsconfig.json',
  ...options,
}));
