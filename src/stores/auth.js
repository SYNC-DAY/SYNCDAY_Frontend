// stores/auth.js
import {defineStore} from "pinia";
import axios from "axios";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
        isInitialized: false,
        user: null  // user 정보 추가
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken
    },

    actions: {
        setAccessToken(token) {
            this.accessToken = token
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            } else {
                delete axios.defaults.headers.common['Authorization']
            }
        },

        async login(email, password) {
            try {
                const response = await axios.post('/user/login', {
                    email,
                    password
                }, {
                    withCredentials: true
                })
                // console.log("로그인 성공으로 돌아온 response: ", response)
                const accessToken = response.headers['authorization']?.replace('Bearer ', '')
                this.setAccessToken(accessToken)
                this.isInitialized = true
                this.user = response.data.data
                // console.log("user 잘 저장되었는지 확인 ", this.user)
                return true
            } catch (error) {
                console.error('Login failed:', error)
                return false
            }
        },

        async initializeAuth() {
            if (this.isInitialized) return true;
            console.log("initializing auth 시작!")
            try {
                const response = await axios.get('/user/profile', {
                    withCredentials: true
                });
                console.log("유저 정보 재요청 돌아온(response): ", response)
                const newAccessToken = response.headers['authorization']?.replace('Bearer ', '');
                if (newAccessToken) {
                    this.setAccessToken(newAccessToken);
                    this.user = response.data.data;  // user 정보 저장
                    this.isInitialized = true;
                    // console.log("initializing user 정보: ", this.user)
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Auth initialization failed:', error);
                this.setAccessToken(null);
                this.user = null;
                this.isInitialized = false;
                return false;
            }
        },

        async logout() {
            try {
                await axios.post('/user/logout', {}, {
                    withCredentials: true
                })
                console.log()
            } catch (error) {
                console.error('Logout failed:', error)
            } finally {
                this.setAccessToken(null)
                this.isInitialized = false  // 로그아웃 시 초기화 상태도 리셋
            }
        },

        // 토큰 리프레시 실패 시 처리
        handleAuthError() {
            this.setAccessToken(null)
            this.isInitialized = false
        }
    }
})