// stores/useAuthStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('github_token'),
    userInfo: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    username: (state) => state.userInfo?.login,
    avatarUrl: (state) => state.userInfo?.avatar_url,
    userRepos: (state) => state.userInfo?.public_repos,
    hasError: (state) => !!state.error
  },

  actions: {
    loginWithGithub() {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
      const scope = 'repo user';
      
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
    },

    async handleAuthCallback(code) {
      this.isLoading = true;
      this.error = null;
      console.log(code);      
      try {
        const response = await axios.get(`${import.meta.env.VITE_SYNCDAY_BACKEND_TOKEN_URI}?code=${code}`);
        let access_token=null;
        if(response.data.success){
          access_token  = response.data.data;
        }
        
        this.setAccessToken(access_token);
        await this.fetchUserInfo();
        
        return true;
      } catch (error) {
        this.error = error.message || 'Authentication failed';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setAccessToken(token) {
      this.accessToken = token;
      localStorage.setItem('github_token', token);
    },

    async fetchUserInfo() {
      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      this.isLoading = true;
      
      try {
        const response = await axios.get('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        this.userInfo = response.data;
        return this.userInfo;
      } catch (error) {
        this.error = error.message || 'Failed to fetch user info';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserRepos() {
      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      this.isLoading = true;
      
      try {
        const response = await axios.get('https://api.github.com/user/repos', {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to fetch repositories';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.accessToken = null;
      this.userInfo = null;
      this.error = null;
      localStorage.removeItem('github_token');
    },

    clearError() {
      this.error = null;
    }
  }
});