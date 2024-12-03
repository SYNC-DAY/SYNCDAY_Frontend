// stores/github/useGithubAuthStore.js
import { defineStore } from "pinia";
import axios from "axios";

// stores/github/useGithubAuthStore.js
export const useGithubAuthStore = defineStore("githubAuth", {
  state: () => ({
    accessToken: localStorage.getItem("github_token") || null,
    githubInstallationId: localStorage.getItem("github_installation_id") || null,
    isLoading: false,
    error: null,
    userInfo: null,
  }),

  getters: {
    getGithubAccessToken: state => state.accessToken,
    getGithubInstallationId: state => state.githubInstallationId,
    isAuthenticated: state => !!state.accessToken,
  },
  actions: {
    initiateGithubIntegration() {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem("github_auth_redirect", currentPath);

      const state = Math.random().toString(36).substring(7);
      localStorage.setItem("github_auth_state", state);

      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
      const scope = "read:user read:repo read:org";

      window.location.href = `https://github.com/login/oauth/authorize?` + `client_id=${clientId}&` + `redirect_uri=${redirectUri}&` + `scope=${scope}&` + `state=${state}`;
    },
    async handleOAuthCallback(code) {
      this.isLoading = true;
      this.error = null;

      try {
        const savedState = localStorage.getItem("github_auth_state");
        // First get the access token using the code
        const response = await axios.post("/user/oauth2/github/access_token", {
          code: code,
          state: savedState,
        });

        if (response.data.success) {
          const accessToken = response.data.data;
          this.setAccessToken(accessToken);

          this.fetchUserInfo();
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

    // This will be called after GitHub App installation
    async fetchUserInfo() {
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
        console.error(error);
      }
    },

    setAccessToken(token) {
      this.accessToken = token;
    },
    setGithubInstallationId(id) {
      this.installationId = id;
    },
  },
});
