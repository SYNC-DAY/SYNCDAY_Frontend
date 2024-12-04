// stores/github/useGithubAppStore.js
import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAppStore = defineStore("githubApp", {
  state: () => ({
    installations: new Map(), // Map to store installations by installationId
    isLoading: false,
    error: null,
  }),

  getters: {
    getInstallationById: state => installationId => {
      return state.installations.get(installationId);
    },

    hasInstallation: state => installationId => {
      return state.installations.has(installationId);
    },

    getAllInstallations: state => {
      return Array.from(state.installations.values());
    },
  },

  actions: {
    async fetchProjectInstallation(installationId) {
      if (!installationId) return;

      // If we already have this installation cached, return early
      if (this.installations.has(installationId)) {
        return this.installations.get(installationId);
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.get(`/vcs/installations/${installationId}`);

        if (response.data.success) {
          const installation = response.data.data;
          this.installations.set(installationId, installation);
          return installation;
        } else {
          throw new Error(response.data.error || "Failed to fetch installation");
        }
      } catch (error) {
        console.error("Error fetching GitHub installation:", error);
        this.error = error.message || "An error occurred while fetching installation";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMultipleInstallations(installationIds) {
      const uniqueIds = [...new Set(installationIds)].filter(id => id && !this.installations.has(id));

      if (uniqueIds.length === 0) return;

      this.isLoading = true;

      try {
        await Promise.all(uniqueIds.map(id => this.fetchProjectInstallation(id)));
      } finally {
        this.isLoading = false;
      }
    },

    clearInstallations() {
      this.installations.clear();
      this.error = null;
    },
  },
});
