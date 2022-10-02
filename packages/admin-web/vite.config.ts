import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }): any => {
  return {
    mode: process.env.MODE,
    outDir: 'dist',
    plugins: [react()],
    build: {
      minify: mode === 'production',
    }
  }
});