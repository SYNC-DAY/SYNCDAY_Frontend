import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAuthStore = defineStore("githubAuth", {
  state: () => ({
    accessToken: localStorage.getItem("github_token"),
    userInfo: null,
    organizations: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: state => !!state.accessToken,
    username: state => state.userInfo?.login,
    avatarUrl: state => state.userInfo?.avatar_url,
    hasError: state => !!state.error,
  },

  actions: {
    async loginWithGithub() {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
      // Include necessary scopes for org access
      const scope = "read:user read:org read:repo";

      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem("github_auth_redirect", currentPath);

      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    },

    async handleAuthCallback(code) {
      this.isLoading = true;
      try {
        // Exchange code for token through backend
        const response = await axios.get(`user/oauth2/github/access_token?code=${code}`);

        if (response.data.success) {
          const accessToken = response.data.data;
          this.setAccessToken(accessToken);
          await this.fetchUserInfo();
          await this.fetchOrganizations();
          return true;
        }
        throw new Error("Failed to get access token");
      } catch (error) {
        console.error("Auth error:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserInfo() {
      if (!this.accessToken) throw new Error("No access token");

      try {
        const response = await axios.get("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        this.userInfo = response.data;
        return this.userInfo;
      } catch (error) {
        console.error("Error fetching user info:", error);
        throw error;
      }
    },

    async fetchOrganizations() {
      if (!this.accessToken) throw new Error("No access token");

      try {
        const response = await axios.get("https://api.github.com/user/orgs", {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        // Get installation status for each org from backend
        const orgsWithInstallation = await Promise.all(
          response.data.map(async org => {
            try {
              const installStatus = await axios.get(`/api/github/installations/${org.login}`);
              return {
                ...org,
                isInstalled: installStatus.data.installed,
                installationId: installStatus.data.installationId,
              };
            } catch (error) {
              return {
                ...org,
                isInstalled: false,
                installationId: null,
              };
            }
          })
        );

        this.organizations = orgsWithInstallation;
        return this.organizations;
      } catch (error) {
        console.error("Error fetching organizations:", error);
        throw error;
      }
    },

    setAccessToken(token) {
      this.accessToken = token;
      localStorage.setItem("github_token", token);
    },

    clearAuth() {
      this.accessToken = null;
      this.userInfo = null;
      this.organizations = [];
      localStorage.removeItem("github_token");
    },
  },
});
