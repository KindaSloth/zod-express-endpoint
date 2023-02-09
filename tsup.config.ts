import { defineConfig } from 'tsup';

const env = process.env.NODE_ENV;

export default defineConfig({
    entryPoints: ['src/index.ts'],
    splitting: false,
    clean: true,
    dts: true,
    format: ['cjs', 'esm'],
    minify: env === 'production',
    bundle: env === 'production',
    skipNodeModulesBundle: true,
    outDir: 'dist',
    entry: ['src/*.ts', 'src/**/*.ts']
});