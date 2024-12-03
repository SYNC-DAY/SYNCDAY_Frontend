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
    getInstallationToken: state => state.installationToken,
    getInstallations: state => state.installations,
  },

  actions: {
    openInstallationWindow() {
      // Replace with your GitHub App's URL
      const installUrl = `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new`;

      const callbackUrl = `${window.location.origin}/github/callback`;
      const fullUrl = `${installUrl}?callback_url=${encodeURIComponent(callbackUrl)}`;

      // Store the current path for redirect after installation
      localStorage.setItem("installation_redirect", window.location.pathname);

      // Open GitHub installation page in a new window
      const width = 1020;
      const height = 618;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      this.installationWindow = window.open(fullUrl, "Install GitHub App", `width=${width},height=${height},top=${top},left=${left}`);
      this.checkWindowInterval = setInterval(() => {
        if (this.installationWindow?.closed) {
          clearInterval(this.checkWindowInterval);
          this.handleInstallationComplete();
        }
      }, 500);
    },

    async handleInstallationCallback(installationId, code) {
      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const response = await axios.post("/vcs/install", {
          installation_id: installationId,
          vcs_type: "GITHUB",
          user_id: authStore.user.userId,
        });

        if (response.data.success) {
          this.installationId = response.data.installationId;
          localStorage.setItem("github_installation_id", this.installationId);

          // Fetch initial installation token
          await this.refreshInstallationToken();
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
