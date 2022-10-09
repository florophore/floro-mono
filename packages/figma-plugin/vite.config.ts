import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  assetsInclude: [
    '../common-assets/assets/**/*.svg',
    '../common-assets/assets/**/*.png',
    '../common-assets/assets/**/*.txt',
    '../common-assets/assets/**/*.ttf',
  ],
  base: '/plugins/floro-figma-plugin/',
  plugins: [react() as any]
});