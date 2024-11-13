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
      
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    },

    async handleAuthCallback(code) {
      this.isLoading = true;
      this.error = null;
      console.log(code);      
      try {
        const response = await axios.get(`${import.meta.env.VITE_SYNCDAY_BACKEND_URI}/api/user/oauth2/github/access_token?code=${code}`);
        
        if(response.data.success){
          const access_token = response.data.data;
          console.log('Access Token:', access_token);
          
          // Set the token first
          this.setAccessToken(access_token);
          
          // Fetch user info
          await this.fetchUserInfo();
          
          // Only redirect after everything is complete
          // window.location.href = import.meta.env.VITE_API_BASE_URL;
        } else {
          throw new Error('Failed to get access token');
        }
        
        return true;
      } catch (error) {
        console.error('Auth error:', error);
        this.error = error.message || 'Authentication failed';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setAccessToken(token) {
      console.log(token)
      this.accessToken = token;
      localStorage.setItem('github_token', token);
    },

    async fetchUserInfo() {
      console.log('fetchUserInfo');
      if (!this.accessToken) {
        console.log("No Access Token");
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

        // GitHub API returns data directly
        this.userInfo = response.data;
        console.log(this.userInfo); // Fixed variable reference
        return this.userInfo;    

      } catch (error) {
        console.log(error.message);
        this.error = error.message || 'Failed to fetch user info';
        throw error;
      } finally {
        console.log("finally clause");
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