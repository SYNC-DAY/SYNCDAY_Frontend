import { defineStore } from "pinia";
import { useGithubAppAuthStore } from "./useGithubAppAuthStore";
import axios from "axios";

export const useGithubOrgStore = defineStore("githubOrg", {
  state: () => ({
    organizations: [],
    selectedOrg: null,
    isLoading: false,
    error: null,
    lastFetchTime: null,
  }),

  getters: {
    hasOrganizations: state => state.organizations.length > 0,
    shouldRefetch: state => {
      if (!state.lastFetchTime) return true;
      return Date.now() - state.lastFetchTime > 5 * 60 * 1000; // 5 minutes cache
    },
  },

  actions: {
    async fetchOrganizations(forceRefresh = false) {
      const githubAppAuth = useGithubAppAuthStore();

      if (!githubAppAuth.isInstalled) {
        throw new Error("GitHub App not installed");
      }

      if (!forceRefresh && !this.shouldRefetch && this.organizations.length > 0) {
        return this.organizations;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.get("/api/github/organizations");
        this.organizations = response.data;
        this.lastFetchTime = Date.now();
        return this.organizations;
      } catch (error) {
        console.error("Error fetching organizations:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setSelectedOrg(org) {
      this.selectedOrg = org;
    },

    clearState() {
      this.organizations = [];
      this.selectedOrg = null;
      this.error = null;
      this.lastFetchTime = null;
    },
  },
});
