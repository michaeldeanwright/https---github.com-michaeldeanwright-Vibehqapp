import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 1. Import the Node.js path module

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 2. Define the '@' shortcut to point directly to your 'src' directory
      '@': path.resolve(import.meta.dirname, './src')
    },
  },
})
