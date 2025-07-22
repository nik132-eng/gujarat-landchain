import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite Configuration for Gujarat LandChain Frontend
// Sprint 6: JuliaOS Wallet Integration
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    cors: true,
    hmr: {
      overlay: false
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'crypto': ['crypto-js', 'bip39', '@ethersproject/hdnode', '@ethersproject/wallet'],
          'solana': ['@solana/web3.js']
        }
      }
    }
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
      '@context': path.resolve(__dirname, './context'),
      '@utils': path.resolve(__dirname, './utils'),
      '@assets': path.resolve(__dirname, './assets')
    }
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js'
  },

  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_APP_NAME': JSON.stringify('Gujarat LandChain'),
    'process.env.VITE_APP_VERSION': JSON.stringify('1.0.0')
  },

  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'crypto-js',
      'bip39',
      '@ethersproject/hdnode',
      '@ethersproject/wallet',
      '@solana/web3.js'
    ],
    exclude: []
  },

  // Preview configuration (for production preview)
  preview: {
    port: 4173,
    host: '0.0.0.0',
    cors: true
  }
})
