import { defineStore } from "pinia";
import axios from "axios";
import { useGithubAuthStore } from "./useGithubAuthStore";

export const useGithubAppStore = defineStore("githubAppStore", {
  state: () => ({
    isLoading: false,
    error: null,
    currentInstallation: null,
  }),

  actions: {
    async initiateInstallation(orgName) {
      const authStore = useGithubAuthStore();
      if (!authStore.isAuthenticated) {
        throw new Error("User must be authenticated");
      }

      try {
        // Get installation URL from backend
        const response = await axios.get(`/api/github/installation-url/${orgName}`);
        // Redirect to GitHub installation flow
        window.location.href = response.data.url;
      } catch (error) {
        console.error("Failed to initiate installation:", error);
        this.error = error.message;
        throw error;
      }
    },

    async handleInstallationCallback(installationId, orgName) {
      this.isLoading = true;
      try {
        // Notify backend about new installation
        await axios.post("/api/github/installations", {
          installationId,
          orgName,
        });

        // Refresh organizations in auth store
        const authStore = useGithubAuthStore();
        await authStore.fetchOrganizations();

        this.currentInstallation = {
          installationId,
          orgName,
        };
      } catch (error) {
        console.error("Failed to handle installation:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async removeInstallation(orgName) {
      this.isLoading = true;
      try {
        await axios.delete(`/api/github/installations/${orgName}`);

        // Refresh organizations in auth store
        const authStore = useGithubAuthStore();
        await authStore.fetchOrganizations();

        this.currentInstallation = null;
      } catch (error) {
        console.error("Failed to remove installation:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
