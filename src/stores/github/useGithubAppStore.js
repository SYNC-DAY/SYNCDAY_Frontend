import { defineStore } from "pinia";
import axios from "axios";
import { useGithubAuthStore } from "./useGithubAuthStore";

export const useGithubAppStore = defineStore("githubAppAuth", {
  state: () => ({
    installationId: null,
    installationToken: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isInstalled: state => !!state.installationId,
    hasError: state => !!state.error,
  },

  actions: {
    async handleAppInstallation(installationId, code) {
      this.isLoading = true;
      this.error = null;

      try {
        // 1. Store the installation ID
        this.installationId = installationId;
        this.code = code;
        // 2. Exchange installation ID for an installation token
        const response = await axios.post("/vcs/install", {
          installation_id: installationId,
          vcs_type: "GITHUB",
          user_id: 1,
          org_login: "three-ping",
        });

        if (response.data.success) {
          // 3. Store the installation token
          this.installationToken = response.data.data.token;

          // 4. Update the auth store with the new token
          const authStore = useGithubAuthStore();

          // 5. Fetch user info with new token

          // 6. Store installation info in localStorage for persistence
          localStorage.setItem("github_installation_id", installationId);
          localStorage.setItem("github_installation_token", this.installationToken);

          return true;
        } else {
          throw new Error("Failed to get installation token");
        }
      } catch (error) {
        console.error("Installation error:", error);
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearInstallation() {
      this.installationId = null;
      this.installationToken = null;
      this.error = null;
      localStorage.removeItem("github_installation_id");
      localStorage.removeItem("github_installation_token");

      // Also clear the auth store
      const authStore = useGithubAuthStore();
      authStore.logout();
    },

    // Initialize from localStorage on app start
    initializeFromStorage() {
      const storedId = localStorage.getItem("github_installation_id");
      const storedToken = localStorage.getItem("github_installation_token");

      if (storedId && storedToken) {
        this.installationId = storedId;
        this.installationToken = storedToken;
      }
    },

    // Check if installation is valid
    async validateInstallation() {
      if (!this.installationId || !this.installationToken) {
        return false;
      }

      try {
        const response = await axios.post("vcs/github/install", {
          headers: {
            Authorization: `Bearer ${this.installationToken}`,
          },
        });

        return response.data.success;
      } catch (error) {
        console.error("Installation validation error:", error);
        this.clearInstallation();
        return false;
      }
    },
  },
});
