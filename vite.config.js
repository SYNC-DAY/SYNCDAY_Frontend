// vite.config.js
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "sockjs-client": "sockjs-client/dist/sockjs.min.js",
    },
  },
  // 프록시 설정을 통해 백엔드 API 요청을 처리합니다.
  // 모든 /api 요청은 백엔드 로드밸런서로 전달됩니다.
  server: {
    proxy: {
      '/api': {
        target: 'https://api.syncday.me',
        changeOrigin: true,  // 호스트 헤더를 대상 URL로 변경하여 CORS 문제 해결
        secure: true  // HTTPS 요청에 대한 SSL 인증서 검증 활성화
      }
    }
  }
});