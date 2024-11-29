import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAuthStore = defineStore("githubAuth", {
  state: () => ({
    accessToken: localStorage.getItem("github_token"),
    userInfo: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: state => !!state.accessToken,
    username: state => state.userInfo?.login,
    avatarUrl: state => state.userInfo?.avatar_url,
    hasError: state => !!state.error,
    getAccessToken: state => {
      if (!state.accessToken) {
        const storedToken = localStorage.getItem("github_token");
        if (storedToken) {
          state.accessToken = storedToken;
        }
      }
      return state.accessToken;
    },
  },

  actions: {
    loginWithGithub(returnPath = null) {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
      const scope = "read:user read:repo read:org read:project";

      // Store the return path or current path for redirect after login
      const redirectPath = returnPath || window.location.pathname + window.location.search;
      localStorage.setItem("github_auth_redirect", redirectPath);

      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    },

    async validateToken() {
      if (!this.accessToken) return false;

      try {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            this.handleInvalidToken();
            return false;
          }
          throw new Error("Token validation failed");
        }

        return true;
      } catch (error) {
        console.error("Token validation error:", error);
        return false;
      }
    },

    handleInvalidToken() {
      this.logout();
      const currentPath = window.location.pathname + window.location.search;
      this.loginWithGithub(currentPath);
    },

    async handleAuthCallback(code) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.get(`user/oauth2/github/access_token?code=${code}`);

        if (response.data.success) {
          const accessToken = response.data.data;
          this.setAccessToken(accessToken);
          await this.fetchUserInfo();
          return true;
        } else {
          throw new Error("Failed to get access token");
        }
      } catch (error) {
        console.error("Auth error:", error);
        this.error = error.message || "Authentication failed";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async ensureAuthenticated() {
      if (!this.isAuthenticated) {
        this.loginWithGithub();
        return false;
      }

      const isValid = await this.validateToken();
      if (!isValid) {
        return false;
      }

      return true;
    },

    setAccessToken(token) {
      this.accessToken = token;
      if (token) {
        localStorage.setItem("github_token", token);
      }
    },

    async fetchUserInfo() {
      if (!this.accessToken) {
        throw new Error("No access token available");
      }

      this.isLoading = true;

      try {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            this.handleInvalidToken();
            throw new Error("Invalid token");
          }
          throw new Error("Failed to fetch user info");
        }

        const userData = await response.json();
        this.userInfo = userData;
        localStorage.setItem("github_user_info", JSON.stringify(userData));
        return userData;
      } catch (error) {
        console.error("Error fetching user info:", error);
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      localStorage.removeItem("github_token");
      localStorage.removeItem("github_user_info");
      this.accessToken = null;
      this.userInfo = null;
      this.error = null;
    },

    clearError() {
      this.error = null;
    },
  },
});
