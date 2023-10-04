import { PluginOption, defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import react from "@vitejs/plugin-react";
import { ManifestV3Export, crx } from "@crxjs/vite-plugin";

import manifestJson from "./manifest.json";

const manifest = manifestJson as ManifestV3Export;

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: [
    '../common-assets/assets/**/*.svg',
    '../common-assets/assets/**/*.png',
    '../common-assets/assets/**/*.txt',
    '../common-assets/assets/**/*.ttf',
  ],
  plugins: [tsconfigPaths(), react(), crx({ manifest }) as PluginOption],
  server: {
    hmr: {
      clientPort: 11119,
      port: 11119,
    }
  }
});
