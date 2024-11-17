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

                const accessToken = response.headers['authorization']?.replace('Bearer ', '')
                this.setAccessToken(accessToken)
                this.isInitialized = true
                return response.data.data  // 로그인 시 받은 유저 정보 반환
            } catch (error) {
                console.error('Login failed:', error)
                return false
            }
        },

        async initializeAuth() {
            if (this.isInitialized) return true;

            try {
                const response = await axios.get('/user/profile', {
                    withCredentials: true
                });

                const newAccessToken = response.headers['authorization']?.replace('Bearer ', '');
                if (newAccessToken) {
                    this.setAccessToken(newAccessToken);
                    this.user = response.data.data;  // user 정보 저장
                    this.isInitialized = true;
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