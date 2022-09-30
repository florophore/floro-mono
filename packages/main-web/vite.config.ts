import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig((): any => {
  return {
    mode: process.env.MODE,
    outDir: 'dist',
    plugins: [react()],
    build: {
      minify: false
    },
    //ssr: {
    //  noExternal: false,
    //  target: 'node',
    //  format: 'cjs'
    //}
  }
});