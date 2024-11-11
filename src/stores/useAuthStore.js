// stores/useAuthStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
import config from '@/config/env'

// axios 인스턴스 생성
const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    githubCode: null,
    accessToken: null,
    userProfile: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    hasError: (state) => !!state.error
  },

  actions: {
    setGithubCode(code) {
      this.githubCode = code
    },

    setAccessToken(token) {
      this.accessToken = token
      localStorage.setItem('github_token', token)
      // 토큰이 설정되면 API 인스턴스의 기본 헤더 업데이트
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    clearAuth() {
      this.githubCode = null
      this.accessToken = null
      this.userProfile = null
      this.error = null
      localStorage.removeItem('github_token')
      delete api.defaults.headers.common['Authorization']
    },

    async fetchAccessToken() {
      if (!this.githubCode) return

      this.loading = true
      try {
        const response = await api.post(config.api.endpoints.githubAuth, {
          code: this.githubCode
        })
        this.setAccessToken(response.data.access_token)
        this.error = null
      } catch (err) {
        this.error = 'Failed to fetch access token'
        console.error('Token fetch error:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchUserProfile() {
      if (!this.accessToken) return

      this.loading = true
      try {
        const response = await axios.get('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
        this.userProfile = response.data
        this.error = null
      } catch (err) {
        this.error = 'Failed to fetch user profile'
        console.error('Profile fetch error:', err)
      } finally {
        this.loading = false
      }
    },

    initializeAuth() {
      const token = localStorage.getItem('github_token')
      if (token) {
        this.setAccessToken(token)
        this.fetchUserProfile()
      }
    }
  }
})