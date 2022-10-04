import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: [
    '../common-assets/assets/**/*.svg',
    '../common-assets/assets/**/*.png',
    '../common-assets/assets/**/*.txt',
    '../common-assets/assets/**/*.ttf',
  ],
  plugins: [react() as any]
});