// plugins/axios.js
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

axios.defaults.baseURL = "http://camp-alb-1280020804.ap-northeast-2.elb.amazonaws.com/api";
axios.defaults.withCredentials = true; // 쿠키 전송을 위해 필수

export function setupAxiosInterceptors() {
  // 요청 인터셉터
  axios.interceptors.request.use(
    config => {
      console.log(`requestUrl: ${config.url}`);
      const authStore = useAuthStore();
      if (authStore.accessToken) {
        console.log("현재 요청의 헤더: ", config.headers["Authorization"]);
        config.headers["Authorization"] = `Bearer ${authStore.accessToken}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
}
