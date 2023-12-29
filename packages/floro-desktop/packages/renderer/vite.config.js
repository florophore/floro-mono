/* eslint-env node */
import 'dotenv/config';

import {chrome} from '../../.electron-vendors.cache.json';
import {renderer} from 'unplugin-auto-expose';
import {join} from 'node:path';
import {injectAppVersion} from '../../version/inject-app-version-plugin.mjs';

import react from '@vitejs/plugin-react';
import nodePolyfills from "rollup-plugin-polyfill-node";
import { nodeModulesPolyfillPlugin } from "esbuild-plugins-node-modules-polyfill";
import { injectEnvVars } from '../../env/inject-env-vars.mjs';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

const serverOptions = process.env.MODE == 'production' ? {
  fs: {
    strict: true,
  },
} : {
  fs: {
    strict: true,
  },
  port: 5176,
  hmr: {
    clientPort: 7779,
    port: 7779,
  }
};

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  base: '',
  server: serverOptions,
  build: {
    sourcemap: process.env.MODE != 'production',
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
    injectAppVersion(),
    injectEnvVars()
  ],
};

export default config;
