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
      // SockJS를 위한 별칭 추가
      "sockjs-client": "sockjs-client/dist/sockjs.min.js",
    },
  },
});
