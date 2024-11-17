// plugins/axios.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true  // 쿠키 전송을 위해 필수

export function setupAxiosInterceptors() {
    // 요청 인터셉터
    axios.interceptors.request.use(
        config => {
            const authStore = useAuthStore()
            if (authStore.accessToken) {
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
            // AT 갱신이 있었는지 확인
            const newAccessToken = response.headers['authorization']?.replace('Bearer ', '')
            if (newAccessToken) {
                const authStore = useAuthStore()
                authStore.setAccessToken(newAccessToken)
                console.log("새로운 accessToken ",newAccessToken)
            }
            return response
        },
        async error => {
            const originalRequest = error.config

            // 401 에러 && 재시도하지 않은 요청
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true
                const authStore = useAuthStore()

                try {
                    // 원래 요청을 그대로 재시도
                    // 필터에서 RT를 확인하고 새 AT를 발급
                    const response = await axios(originalRequest)
                    return response
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError)
                    await authStore.logout()
                    router.push('/login')
                    return Promise.reject(refreshError)
                }
            }

            return Promise.reject(error)
        }
    )
}