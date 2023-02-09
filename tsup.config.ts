import { defineConfig } from 'tsup';

const env = process.env.NODE_ENV;

export default defineConfig({
    entry: ['src/index.ts'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    format: ['cjs'],
});