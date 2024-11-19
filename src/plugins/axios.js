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
            // (만료된 at를 들고 요청을 한 경우)
            const originalRequest = error.config
            console.log("at가 없어서 재요청을 하는 경우의 시작 로그")
            // 401 에러 && 재시도하지 않은 요청
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true
                const authStore = useAuthStore()
                console.log("재정의된 accessToken: ",authStore.accessToken)

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