// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '^/api': {                        // '^' 추가하여 정확한 경로 매칭
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,                   // SSL 관련 검증 비활성화
        configure: (proxy, options) => {
          // proxy 동작 로깅
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy Response:', proxyRes.statusCode);
          });
        }
      }
    }
  }
})