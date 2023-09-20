import {chrome} from '../../.electron-vendors.cache.json';
import {preload} from 'unplugin-auto-expose';
import { injectAppVersion } from '../../version/inject-app-version-plugin.mjs';
import { injectEnvVars } from '../../env/inject-env-vars.mjs';

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  build: {
    ssr: true,
    sourcemap: 'inline',
    target: `chrome${chrome}`,
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
  plugins: [preload.vite(), injectAppVersion(), injectEnvVars()],
};

export default config;