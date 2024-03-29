import { sentryVitePlugin } from "@sentry/vite-plugin";
import {node} from '../../.electron-vendors.cache.json';
import {join} from 'node:path';
import {injectAppVersion} from '../../version/inject-app-version-plugin.mjs';
import { injectEnvVars } from '../../env/inject-env-vars.mjs';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

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

  build: {
    ssr: true,
    sourcemap: true,
    target: `node${node}`,
    outDir: 'dist',
    assetsDir: '.',
    minify: process.env.MODE !== 'development',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },

  plugins: [injectAppVersion(), injectEnvVars(), sentryVitePlugin({
    org: "cheqout-payments-inc",
    project: "floro-desktop"
  })]
};

export default config;