// stores/github/useGithubRepoStore.js
import { defineStore } from "pinia";
// import { useGithubAppAuthStore } from "./useGithubAppStore";
import axios from "axios";

export const useGithubRepoStore = defineStore("githubRepo", {
  state: () => ({
    repositories: {},
    selectedRepo: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getOrgRepositories: state => orgName => state.repositories[orgName] || [],
  },

  actions: {
    async fetchOrgRepositories(orgName) {
      const githubAppAuth = useGithubAppAuthStore();

      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.get(`/api/github/organizations/${orgName}/repositories`);
        this.repositories[orgName] = response.data;
        return this.repositories[orgName];
      } catch (error) {
        console.error("Error fetching repositories:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setSelectedRepo(repo) {
      this.selectedRepo = repo;
    },

    clearState() {
      this.repositories = {};
      this.selectedRepo = null;
      this.error = null;
    },
  },
});
