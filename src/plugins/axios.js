// plugins/axios.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true  // 쿠키 전송을 위해 필수

export function setupAxiosInterceptors() {
    // 요청 인터셉터
    axios.interceptors.request.use(
        config => {
            const authStore = useAuthStore()
            if (authStore.accessToken) {
                console.log("현재 요청의 헤더: ", config.headers['Authorization'])
                config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
            }
            return config
        },
        error => {
            return Promise.reject(error)
        }
    )

    // 응답 인터셉터
    axios.interceptors.response.use(
        response => {
            // 새로고침을 한 경우 작동하는 interceptor
            console.log("Request URL:", response.config.url);
            // console.log("새로 고침이나 첫 로그인을 할 경우 돌아온 response: ", response.data)
            const newAccessToken = response.headers['authorization']?.replace('Bearer ', '')
            if (newAccessToken) {
                const authStore = useAuthStore()
                authStore.setAccessToken(newAccessToken)
                // console.log("새로 도착한 authStore:", authStore)
                // console.log("새로 갱신받은 accessToken: ",newAccessToken)
            }
            return response
        },
        async error => {
            const originalRequest = error.config
            // 에러 응답에서도 새로운 토큰이 있는지 확인
            const newAccessToken = error.response?.headers['authorization']?.replace('Bearer ', '')
            console.log("at가 만료되어 없는 경우 새로 발급받은 at: ", newAccessToken)
            if (newAccessToken) {
                const authStore = useAuthStore()
                authStore.setAccessToken(newAccessToken)
                // 새로운 토큰으로 원래 요청 재시도
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
                return axios(originalRequest)
            }

            return Promise.reject(error)
        }
    )
}