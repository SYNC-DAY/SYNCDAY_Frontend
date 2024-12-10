// plugins/axios.js
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// 모든 API 요청의 기본 경로를 /api로 설정
axios.defaults.baseURL = 'https://api.syncday.me/api';

axios.defaults.withCredentials = true;

export function setupAxiosInterceptors() {
  // 요청 인터셉터 설정
  axios.interceptors.request.use(
    config => {
      // API 요청 경로를 로깅하여 디버깅을 돕습니다
      console.log(`Making API request to: ${config.url}`);
      
      const authStore = useAuthStore();
      
      // 인증 토큰이 있다면 요청 헤더에 추가합니다
      if (authStore.accessToken) {
        config.headers["Authorization"] = `Bearer ${authStore.accessToken}`;
        console.log("Request includes authorization token");
      }
      
      return config;
    },
    error => {
      console.error("Request configuration error:", error);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 설정
  axios.interceptors.response.use(
    response => response,
    error => {
      // API 요청 실패 시 자세한 에러 정보를 제공합니다
      if (error.response) {
        console.error(`API Error ${error.response.status}:`, error.response.data);
      } else if (error.request) {
        console.error("No response received from API");
      } else {
        console.error("Request setup error:", error.message);
      }
      
      return Promise.reject(error);
    }
  );
}