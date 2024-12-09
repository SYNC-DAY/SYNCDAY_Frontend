import { defineStore } from "pinia";
import axios from "axios";

export const useGithubRepoStore = defineStore("githubRepo", {
  state: () => ({
    repositories: {}, // Format: { installationId: { repoName: { name, url, ... } } }
    loading: false,
    error: null,
    currentRepository: null,
  }),

  getters: {
    getRepositoriesByInstallation: state => installationId => {
      return state.repositories[installationId] || {};
    },
    isLoading: state => state.loading,
    getError: state => state.error,
    getCurrentRepository: state => state.currentRepository,
    getAllInstallations: state => Object.keys(state.repositories),
  },

  actions: {
    async fetchRepositories(installationId) {
      try {
        this.loading = true;
        this.error = null;

        const response = await axios.get(`/github/repos/installations/${installationId}`);

        // Convert array to object with repository names as keys
        const repoObject = response.data.reduce((acc, repo) => {
          acc[repo.name] = {
            name: repo.name,
            url: repo.html_url,
            description: repo.description,
            private: repo.private,
            defaultBranch: repo.default_branch,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            // Add any other repository properties you need
          };
          return acc;
        }, {});

        // Update state using the installation ID as the key
        this.repositories = {
          ...this.repositories,
          [installationId]: repoObject,
        };
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to fetch repositories";
        console.error("Error fetching repositories:", err);
      } finally {
        this.loading = false;
      }
    },

    setCurrentRepository(installationId, repoName) {
      this.currentRepository = this.repositories[installationId]?.[repoName] || null;
    },

    clearRepositories(installationId = null) {
      if (installationId) {
        // Clear repositories for specific installation
        const { [installationId]: _, ...rest } = this.repositories;
        this.repositories = rest;
      } else {
        // Clear all repositories
        this.repositories = {};
      }
      this.currentRepository = null;
      this.error = null;
    },

    updateRepository(installationId, repoName, updates) {
      if (this.repositories[installationId]?.[repoName]) {
        this.repositories[installationId][repoName] = {
          ...this.repositories[installationId][repoName],
          ...updates,
        };

        if (this.currentRepository?.name === repoName) {
          this.currentRepository = this.repositories[installationId][repoName];
        }
      }
    },

    // Helper method to get a specific repository
    getRepository(installationId, repoName) {
      return this.repositories[installationId]?.[repoName] || null;
    },
  },
});
