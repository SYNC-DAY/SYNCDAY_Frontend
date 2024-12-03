// stores/github/useGithubAppStore.js
import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "../auth";
export const useGithubAppStore = defineStore("githubApp", {
  state: () => ({
    installationId: localStorage.getItem("github_installation_id"),
    installationToken: null,
    installations: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    isInstalled: state => !!state.installationId,
    hasError: state => !!state.error,
  },

  actions: {
    async handleInstallationCallback(installationId) {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const response = await axios.post("/vcs/install", {
          vcs_type: "GITHUB",
          user_id: authStore.user.userId,
          installation_id: installationId,
        });

        if (response.data.success) {
          this.installationId = installationId;
          localStorage.setItem("github_installation_id", installationId);
          return true;
        }
        throw new Error("Installation failed");
      } catch (error) {
        console.error("Installation error:", error);
        this.error = error.response?.data?.message || "Installation failed";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async refreshInstallationToken() {
      if (!this.installationId) {
        throw new Error("No installation ID available");
      }

      try {
        const response = await axios.get(`/api/github/installation/${this.installationId}/token`);

        if (response.data.success) {
          this.installationToken = response.data.token;
          return this.installationToken;
        }
        throw new Error("Failed to get installation token");
      } catch (error) {
        console.error("Token refresh error:", error);
        this.error = error.response?.data?.message || "Token refresh failed";
        throw error;
      }
    },

    async fetchInstallations() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.get("/api/github/installations");
        this.installations = response.data;
        return this.installations;
      } catch (error) {
        console.error("Error fetching installations:", error);
        this.error = error.response?.data?.message || "Failed to fetch installations";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async removeInstallation(installationId) {
      this.isLoading = true;
      this.error = null;

      try {
        await axios.delete(`/api/github/installations/${installationId}`);

        if (this.installationId === installationId) {
          this.installationId = null;
          this.installationToken = null;
          localStorage.removeItem("github_installation_id");
        }

        await this.fetchInstallations();
      } catch (error) {
        console.error("Error removing installation:", error);
        this.error = error.response?.data?.message || "Failed to remove installation";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    reset() {
      this.installationId = null;
      this.installationToken = null;
      this.installations = [];
      this.error = null;
      localStorage.removeItem("github_installation_id");
    },
  },
});
