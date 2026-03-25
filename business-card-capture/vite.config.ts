import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Power Apps Code Apps - Vite configuration
// When deploying to Power Platform, the build output is packaged via PAC CLI
// Run: pac power-fx pack --msapp BusinessCardCapture.msapp --sources .

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
