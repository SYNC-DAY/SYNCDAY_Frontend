import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAuthStore = defineStore("githubAuth", {
  state: () => ({
    accessToken: localStorage.getItem("github_token"),
    userInfo: null,
    isLoading: false,
    error: null,
    authInitialized: false, // New flag to track initialization
  }),

  getters: {
    isAuthenticated: state => !!state.accessToken && !!state.userInfo,
    username: state => state.userInfo?.login,
    avatarUrl: state => state.userInfo?.avatar_url,
    hasError: state => !!state.error,
  },

  actions: {
    async initialize() {
      if (this.accessToken || !this.userInfo) {
        try {
          await this.fetchUserInfo();
        } catch (error) {
          // Token might be invalid, clear it
          this.clearAuth();
        }
      }
      this.authInitialized = true;
    },

    async loginWithGithub() {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
      const scope = "read:user read:org";

      // Store current path for redirect after auth
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem("github_auth_redirect", currentPath);

      const state = Math.random().toString(36).substring(7);
      localStorage.setItem("github_auth_state", state);
      // Store current modal state if needed
      if (window.localStorage.getItem("showProjectSettings")) {
        localStorage.setItem("returnToProjectSettings", "true");
      }

      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    },

    async handleAuthCallback(code) {
      this.isLoading = true;
      this.error = null;

      try {
        const savedState = localStorage.getItem("github_auth_state");
        const response = await axios.post("user/oauth2/github/access_token", {
          code: code,
          state: savedState,
        });

        if (response.data.success) {
          const tokenData = response.data.data;
          console.log(tokenData);
          // Store tokens and expiration
          localStorage.setItem("github_access_token", tokenData.access_token);
          localStorage.setItem("github_refresh_token", tokenData.refresh_token);
          localStorage.setItem("github_token_expiry", new Date().getTime() + tokenData.expires_in * 1000);
          localStorage.setItem("github_refresh_token_expiry", new Date().getTime() + tokenData.refresh_token_expires_in * 1000);
          console.log(`this.handleAuthCallback, at:${tokenData.accessToken}}`);
          this.setAccessToken(tokenData.access_token);

          // Setup token refresh timing
          // const refreshTime = (tokenData.expiresIn - 300) * 1000; // 5 minutes before expiry
          // setTimeout(() => this.refreshToken(), refreshTime);

          await this.fetchUserInfo();

          // Clear the state after successful auth
          localStorage.removeItem("github_auth_state");
        } else {
          this.error = "Authentication failed";
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Authentication failed";
        console.error("Auth error:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async refreshToken() {
      try {
        const refreshToken = localStorage.getItem("github_refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post("user/oauth2/github/refresh_token", {
          refresh_token: refreshToken,
        });

        if (response.data.success) {
          const tokenData = response.data.data;

          // Update stored tokens and expiration
          localStorage.setItem("github_access_token", tokenData.accessToken);
          localStorage.setItem("github_refresh_token", tokenData.refreshToken);
          localStorage.setItem("github_token_expiry", new Date().getTime() + tokenData.expiresIn * 1000);
          localStorage.setItem("github_refresh_token_expiry", new Date().getTime() + tokenData.refreshTokenExpiresIn * 1000);

          // Setup next refresh
          const refreshTime = (tokenData.expiresIn - 300) * 1000;
          setTimeout(() => this.refreshToken(), refreshTime);
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Handle refresh failure (e.g., redirect to login)
        window.location.href = "/login";
      }
    },
    getAccessToken() {
      const token = localStorage.getItem("github_access_token");
      const expiry = localStorage.getItem("github_token_expiry");

      if (!token || !expiry) {
        return null;
      }

      // Check if token is expired
      if (new Date().getTime() > parseInt(expiry)) {
        return null;
      }

      return token;
    },

    async fetchUserInfo() {
      if (!this.accessToken) return null;

      try {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        const userData = await response.json();
        this.userInfo = userData;
        localStorage.setItem("github_user_info", JSON.stringify(userData));
        return this.userInfo;
      } catch (error) {
        console.error("Error fetching user info:", error);
        this.error = error.message;
        throw error;
      }
    },

    setAccessToken(token) {
      this.accessToken = token;
      if (token) {
        localStorage.setItem("github_token", token);
      }
    },

    clearAuth() {
      this.accessToken = null;
      this.userInfo = null;
      this.error = null;
      localStorage.removeItem("github_token");
    },
  },
});
