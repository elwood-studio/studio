import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  treeshake: true,
  splitting: true,
  entry: ['src/**/*.ts'],
  format: ['esm'],
  dts: false,
  minify: true,
  clean: true,
  external: [],
  legacyOutput: false,
  platform: 'node',
  tsconfig: './tsconfig.json',
  ...options,
}));
