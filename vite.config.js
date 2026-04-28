import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://placement-interaction-system-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
