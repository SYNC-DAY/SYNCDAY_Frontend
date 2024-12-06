// stores/githubAppStore.js
import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "../auth";
export const useGithubAppStore = defineStore("githubApp", {
  state: () => ({
    installations: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getInstallations: state => state.installations,
    isInstallationsLoading: state => state.isLoading,
  },

  actions: {
    async fetchInstallations() {
      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const response = await axios.get(`/github/install/${authStore.user.userId}`);

        if (response.data.success) {
          // Process installations to remove duplicates
          const installations = response.data.data;

          // Create a map to track latest installation for each account_id
          const latestInstallations = new Map();

          installations.forEach(installation => {
            const existingInstallation = latestInstallations.get(installation.account_id);

            if (!existingInstallation || new Date(installation.createdAt) > new Date(existingInstallation.createdAt)) {
              latestInstallations.set(installation.account_id, installation);
            }
          });

          // Convert map values back to array and store
          this.installations = Array.from(latestInstallations.values()).map(installation => ({
            id: installation.id,
            installationId: installation.installation_id,
            accountId: installation.account_id,
            accountName: installation.account_name,
            accountType: installation.account_type,
            avatarUrl: installation.avatar_url,
            htmlUrl: installation.html_url,
            status: installation.status,
            createdAt: installation.createdAt,
            updatedAt: installation.updatedAt,
            userId: installation.user_id,
          }));
        }
      } catch (error) {
        console.error("Error fetching GitHub installations:", error);
        this.error = error.response?.data?.error || "Failed to fetch installations";
      } finally {
        this.isLoading = false;
      }
    },

    clearInstallations() {
      this.installations = [];
      this.error = null;
    },
  },
});
