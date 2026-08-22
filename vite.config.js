import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
          rbac: ['src/lib/rbac.js'],
          charts: ['src/components/charts/MoistureSparkline.jsx', 'src/components/charts/RainfallBars.jsx'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true },
      '/health': 'http://localhost:8000',
      '/api/health': 'http://localhost:8000',
    },
  },
})
