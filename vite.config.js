import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React core into its own chunk
          'vendor-react': ['react', 'react-dom'],
          // Split router
          'vendor-router': ['react-router-dom'],
          // Split lucide icons (large library)
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
