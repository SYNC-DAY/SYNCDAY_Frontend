// store/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
        refreshToken: null,
        user: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken && !!state.user,
    },

    actions: {
        async login(email, password) {
            console.log("login 시작")
            try {
                console.log("요청 데이터:", { emil: email, password: password })

                const response = await axios.post('/user/login', {
                    email: email,
                    password: password
                })

                console.log("응답 데이터:", response)
                console.log("response.data.data: ", response.data.data)

                const accessToken = response.headers['authorization']?.replace('Bearer ', '')
                const refreshToken = response.headers['refresh-token']

                this.accessToken = accessToken
                this.refreshToken = refreshToken
                this.user = response.data.data
                console.log('accessToken:', accessToken)
                console.log('refreshToken:', refreshToken)
                console.log('user: ', this.user)
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

                return true
            } catch (error) {
                console.error('Login failed:', error)
                console.error('Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers
                })
                return false
            }
        },

        async refreshAccessToken() {
            try {
                // 현재 요청을 보낸 API의 원래 엔드포인트로 다시 요청
                const originalRequest = this.refreshToken.config

                // RT를 헤더에 추가
                originalRequest.headers['Refresh-Token'] = this.refreshToken

                // 원래 요청 다시 시도 (이때 필터에서 자동으로 AT 갱신)
                const response = await axios(originalRequest)

                // 응답 헤더에서 새로운 AT 추출
                const newAccessToken = response.headers['Authorization']?.replace('Bearer ', '')
                if (newAccessToken) {
                    this.accessToken = newAccessToken
                    axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
                }

                return response
            } catch (error) {
                this.logout()
                throw error
            }
        },

        async fetchUserInfo() {
            try {
                const response = await axios.get('/user/profile')
                this.user = response.data.data
                return true
            } catch (error) {
                console.error('Failed to fetch user info:', error)
                throw error
            }
        },

        async logout() {
            try {
                // logout 요청
                await axios.post('/user/logout', {}, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                })
            } catch (error) {
                console.error('Logout failed:', error)
            } finally {
                // 로컬 상태 초기화
                this.accessToken = null
                this.refreshToken = null
                this.user = null

                // axios 초기화
                delete axios.defaults.headers.common['Authorization']
                delete axios.defaults.headers.common['Refresh-Token']
            }
        }
    }
})