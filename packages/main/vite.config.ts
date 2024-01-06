import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function JSONHmr() {
  return {
    name: 'json-hmr',
    enforce: 'post',
    // HMR
    handleHotUpdate({ file, server }) {
      if (file.includes("text") && file.endsWith('.json')) {
        console.log('reloading json file...');

        server.ws.send({
          type: 'full-reload',
          path: '*'
        });
      }
    },
  }
}

function defineCDNHost() {
  return {
    name: 'cdn-host',
    config: () => {
      const cdnHost = process.env?.CDN_HOST ?? "http://localhost:9000/public";
      process.env.VITE_CDN_HOST = cdnHost;
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }): any => {
  const cdnHost = process.env?.CDN_HOST ?? "";
  return {
    mode: process.env.MODE,
    outDir: 'dist',
    plugins: [react(), JSONHmr(), defineCDNHost()],
    publicDir: 'public',
    assetsInclude: [
      '../common-assets/assets/**/*.svg',
      '../common-assets/assets/images/**/*.svg',
      '../common-assets/assets/images/icons/**/*.svg',
      '../common-assets/assets/images/repo_icons/**/*.svg',
      '../common-assets/assets/images/rich_text_icons/**/*.svg',
      '../common-assets/assets/**/*.png',
      '../common-assets/assets/**/*.txt',
      '../common-assets/assets/**/*.ttf',
    ],
    server: {
      hmr: {
        clientPort: 7777,
        port: 7777,
      }
    },
    experimental: {
      renderBuiltUrl: (filename: string, { hostId }) => {
        if (command == "build" && cdnHost != "") {
          return `${cdnHost}/${filename}`;
        }
        return { relative: true };
      },
    },
  }
});