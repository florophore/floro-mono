import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  assetsInclude: [
    '../common-assets/assets/**/*.svg',
    '../common-assets/assets/**/*.png',
    '../common-assets/assets/**/*.txt',
    '../common-assets/assets/**/*.ttf',
    './floro.manifest.json',
    './palette-plguin-icon.svg',
  ],
  base: '/plugins/floro-palette-plugin/',
  plugins: [react() as any],
  publicDir: 'public'
});