// plugins/axios.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// baseURL 설정
axios.defaults.baseURL = '/api'

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
        response => response,
        async error => {
            const originalRequest = error.config
            const authStore = useAuthStore()

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true

                try {
                    originalRequest.headers['Refresh-Token'] = authStore.refreshToken
                    return await axios(originalRequest)
                } catch (refreshError) {
                    await authStore.logout()
                    router.push('/login')
                    return Promise.reject(refreshError)
                }
            }

            return Promise.reject(error)
        }
    )
}