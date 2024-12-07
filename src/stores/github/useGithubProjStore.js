import { defineStore } from "pinia";
import axios from "axios";

export const useGithubProjectsStore = defineStore("githubProjects", {
  state: () => ({
    projects: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getProjects: state => state.projects,
    getLoadingState: state => state.isLoading,
    getError: state => state.error,
  },

  actions: {
    async fetchProjects(installationId) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.get(`/api/${installationId}/projects`);
        this.projects = response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to fetch projects";
        console.error("Error fetching GitHub projects:", error);
      } finally {
        this.isLoading = false;
      }
    },

    resetState() {
      this.projects = [];
      this.isLoading = false;
      this.error = null;
    },
  },
});
