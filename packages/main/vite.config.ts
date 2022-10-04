import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }): any => {
  return {
    mode: process.env.MODE,
    outDir: 'dist',
    plugins: [react()],
    assetsInclude: [
      '../common-assets/assets/**/*.svg',
      '../common-assets/assets/**/*.png',
      '../common-assets/assets/**/*.txt',
      '../common-assets/assets/**/*.ttf',
    ],
    server: {
      hmr: {
        clientPort: 7777,
        port: 7777,
      }
    }
  }
});