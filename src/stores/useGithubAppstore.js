// stores/useGithubAppStore.js
import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAppStore = defineStore("githubApp", {
  state: () => ({
    installationId: null,
    error: null,
    isLoading: false,
  }),

  actions: {
    async initiateGithubAppInstallation() {
      const appName = import.meta.env.VITE_GITHUB_APP_NAME;
      const clientId = import.meta.env.VITE_GITHUB_APP_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_APP_REDIRECT_URI;

      // Redirect to GitHub App installation page
      window.location.href = `https://github.com/apps/${appName}/installations/new`;
    },

    async handleInstallation(installationId) {
      this.isLoading = true;
      try {
        // Send installation ID to backend
        const response = await axios.post("/api/github/installation", {
          installationId: installationId,
        });

        if (response.data.success) {
          this.installationId = installationId;
          return true;
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOrganizationData() {
      if (!this.installationId) {
        throw new Error("No installation ID available");
      }

      try {
        const response = await axios.get("/api/github/org");
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },
  },
});
