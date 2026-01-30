import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for OneDrive/file system deployment
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
