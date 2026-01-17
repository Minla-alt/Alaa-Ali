import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    proxy: process.env.NODE_ENV === 'development' ? {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    } : undefined
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['react-i18next', 'i18next', 'i18next-browser-languagedetector'],
          icons: ['lucide-react']
        }
      }
    }
  },
  define: {
    // Ensure proper environment variable handling
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})