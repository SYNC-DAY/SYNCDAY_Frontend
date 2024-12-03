import { defineStore } from "pinia";
import { useGithubAuthStore } from "./useGithubAuthStore";
import { Octokit } from "@octokit/rest";

const ORGS_STORAGE_KEY = "github_organizations";
const SELECTED_ORG_KEY = "github_selected_org";

export const useGithubOrgStore = defineStore("githubOrg", {
  state: () => ({
    organizations: [],
    selectedOrg: null,
    orgRepositories: {},
    isLoading: false,
    error: null,
    lastFetchTime: null,
    octokit: null,
  }),

  getters: {
    allOrganizations: state => state.organizations,
    currentOrg: state => state.selectedOrg,
    hasError: state => !!state.error,
    getOrgRepositories: state => orgName => state.orgRepositories[orgName] || [],
    shouldRefetch: state => {
      if (!state.lastFetchTime) return true;
      // Refetch if data is older than 5 minutes
      return Date.now() - state.lastFetchTime > 5 * 60 * 1000;
    },
  },

  actions: {
    initializeOctokit() {
      const authStore = useGithubAuthStore();
      const token = authStore.accessToken;

      if (!token) {
        throw new Error("No access token available");
      }

      this.octokit = new Octokit({
        auth: token,
      });
    },

    async fetchOrganizations() {
      try {
        const accessToken = localStorage.getItem("github_access_token");

        const response = await fetch("https://api.github.com/user/orgs", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        // Response will contain array of organizations
        const organizations = response.data;
        return organizations;
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
        throw error;
      }
    },

    async fetchOrgRepositories(orgName) {
      try {
        if (!this.octokit) {
          this.initializeOctokit();
        }

        this.isLoading = true;

        const { data: repos } = await this.octokit.rest.repos.listForOrg({
          org: orgName,
          type: "all",
          sort: "updated",
          direction: "desc",
        });

        this.orgRepositories[orgName] = repos;
        return repos;
      } catch (error) {
        console.error("Error fetching organization repositories:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOrgMembers(orgName) {
      try {
        if (!this.octokit) {
          this.initializeOctokit();
        }

        const { data: members } = await this.octokit.rest.orgs.listMembers({
          org: orgName,
          per_page: 100,
        });

        return members;
      } catch (error) {
        console.error("Error fetching organization members:", error);
        this.error = error.message;
        throw error;
      }
    },

    setSelectedOrg(org) {
      this.selectedOrg = org;
      localStorage.setItem(SELECTED_ORG_KEY, JSON.stringify(org));
      if (org) {
        this.fetchOrgRepositories(org.login);
      }
    },

    saveToLocalStorage() {
      localStorage.setItem(
        ORGS_STORAGE_KEY,
        JSON.stringify({
          organizations: this.organizations,
          timestamp: Date.now(),
        })
      );
    },

    loadFromLocalStorage() {
      const stored = localStorage.getItem(ORGS_STORAGE_KEY);

      if (stored) {
        const data = JSON.parse(stored);
        if (Date.now() - data.timestamp < 5 * 60 * 1000) {
          this.organizations = data.organizations;
          this.lastFetchTime = data.timestamp;
        }
      }
    },

    clearState() {
      this.organizations = [];
      this.selectedOrg = null;
      this.orgRepositories = {};
      this.error = null;
      this.lastFetchTime = null;
      this.octokit = null;
      localStorage.removeItem(ORGS_STORAGE_KEY);
      localStorage.removeItem(SELECTED_ORG_KEY);
    },

    clearError() {
      this.error = null;
    },
  },
});
