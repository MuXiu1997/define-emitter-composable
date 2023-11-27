/// <reference types="vitest" />

import { dependencies, name } from './package.json'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import path from 'node:path'

const libName = name.replace(/^@.*\//, '')

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '~': `${path.resolve(__dirname, 'src')}`,
      '#/': `${path.resolve(__dirname, 'test')}/`,
      '#': `${path.resolve(__dirname, 'test')}`,
    },
  },
  build: {
    lib: {
      name: libName,
      entry: 'src/index.ts',
      fileName: format => `${libName}.${format}.js`,
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: Object.keys(dependencies),
    },
    sourcemap: true,
  },
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/**/*'],
      outDir: '.',
    }),
  ],
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
    },
  },
})
