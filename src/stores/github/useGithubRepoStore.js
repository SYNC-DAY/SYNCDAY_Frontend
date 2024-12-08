import { defineStore } from "pinia";
import { useGithubAppStore } from "./useGithubAppStore";

export const useGithubRepoStore = defineStore("githubRepo", {
  state: () => ({
    repositories: {}, // Keyed by installationId
  }),

  actions: {
    // Add more specific error handling
    async fetchRepositories(installationId) {
      const appStore = useGithubAppStore();
      try {
        if (!installationId) {
          throw new Error("Installation ID is required");
        }

        if (!appStore.installations[installationId]) {
          throw new Error(`No installation found for ID: ${installationId}`);
        }

        const response = await fetch(/*...*/);

        // Add specific error handling for different status codes
        if (response.status === 401) {
          throw new Error("Authentication failed - token may be expired");
        }
        if (response.status === 404) {
          throw new Error("Installation not found or no access to repositories");
        }
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // Validate the response data
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format: expected array of repositories");
        }

        this.repositories[installationId] = data;
        return data;
      } catch (error) {
        console.error(`Error fetching repositories for installation ${installationId}:`, error);
        throw error;
      }
    },

    // Add type checking for repository data
    saveRepositories(installationId, repositories) {
      if (!Array.isArray(repositories)) {
        throw new Error("Repositories must be an array");
      }
      this.repositories[installationId] = repositories;
    },

    getRepositoriesByInstallation(installationId) {
      return this.repositories[installationId] || [];
    },

    clearRepositories(installationId) {
      if (installationId) {
        delete this.repositories[installationId];
      } else {
        this.repositories = {};
      }
    },
  },

  getters: {
    getAllRepositories: state => state.repositories,

    getRepositoryCount: state => installationId => {
      const repos = state.repositories[installationId];
      return repos ? repos.length : 0;
    },

    hasRepositories: state => installationId => {
      return !!state.repositories[installationId]?.length;
    },
  },
});
