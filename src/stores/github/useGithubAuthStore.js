// stores/github/useGithubAuthStore.js
import { defineStore } from "pinia";
import axios from "axios";

// stores/github/useGithubAuthStore.js
export const useGithubAuthStore = defineStore("githubAuth", {
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

          // After getting the token, redirect to GitHub App installation
          const appId = import.meta.env.VITE_GITHUB_APP_ID;
          window.location.href = `https://github.com/apps/${appId}/installations/new`;
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
    async handleAppInstallation(installationId) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.post("/user/oauth2/github/app/install", {
          installationId: installationId,
        });

        if (response.data.success) {
          this.setInstallationId(installationId);
          await this.fetchUserInfo();
          return true;
        }
      } catch (error) {
        console.error("Installation error:", error);
        this.error = error.message || "Installation failed";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
