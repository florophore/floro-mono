import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }): any => {
  return {
    mode: process.env.MODE,
    outDir: 'dist',
    plugins: [react()],
    assetsInclude: [
      '@floro/common-assets/assets/**/*.svg',
      '@floro/common-assets/assets/**/*.png',
      '@floro/common-assets/assets/**/*.ttf',
      '@floro/common-assets/assets/**/*.txt',
    ],
    build: {
      minify: mode === 'production',
    },
    server: {
      hmr: {
        clientPort: 7778,
        port: 7778,
      }
    }
  }
});