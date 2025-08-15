import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React 19 features
      jsxImportSource: 'react',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/contexts': resolve(__dirname, 'src/contexts'),
      '@/assets': resolve(__dirname, 'src/assets'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/utils': resolve(__dirname, 'src/utils'),
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['react-icons'],
          utils: ['axios'],
        },
      },
    },
  },
  define: {
    // For compatibility with CRA's REACT_APP_ environment variables
    'process.env': {},
  },
  envPrefix: 'VITE_',
  css: {
    postcss: './postcss.config.js',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
