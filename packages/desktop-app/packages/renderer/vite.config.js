/* eslint-env node */

import {chrome} from '../../.electron-vendors.cache.json';
import {join} from 'path';
import react from '@vitejs/plugin-react';
import {renderer} from 'unplugin-auto-expose';


import nodePolyfills from "rollup-plugin-polyfill-node";
import { defineConfig } from "vite";
import { nodeModulesPolyfillPlugin } from "esbuild-plugins-node-modules-polyfill";

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  base: '',
  server: {
    fs: {
      strict: true,
    },
    hmr: {
      clientPort: 7779,
      port: 7779,
    }
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: join(PACKAGE_ROOT, 'index.html'),
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  test: {
    environment: 'happy-dom',
  },
  optimizeDeps: {
    esbuildOptions: {
        // Enable esbuild polyfill plugins
        plugins: [
            nodeModulesPolyfillPlugin()
        ]
    }
},
  plugins: [
    nodePolyfills(),
    react(),
    renderer.vite({
      preloadEntry: join(PACKAGE_ROOT, '../preload/src/index.ts'),
    }),
  ],
};

export default config;
