import { defineStore } from "pinia";
import { useGithubAuthStore } from "./useGithubAuthStore";
import { Octokit } from "@octokit/rest";

// Constants for localStorage keys
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
    installations: {}, // Track GitHub App installations per org
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
    isOrgInstalled: state => orgName => !!state.installations[orgName],
  },

  actions: {
    // Initialize Octokit instance with authentication
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

    // Fetch organizations with installation status
    async fetchOrganizations(forceRefresh = false) {
      try {
        if (!this.octokit) {
          this.initializeOctokit();
        }

        if (!forceRefresh && !this.shouldRefetch && this.organizations.length > 0) {
          return this.organizations;
        }

        this.isLoading = true;

        // Fetch user's organizations
        const { data: orgs } = await this.octokit.rest.orgs.listForAuthenticatedUser();

        // Fetch installation status for each organization
        const detailedOrgs = await Promise.all(
          orgs.map(async org => {
            try {
              // Get detailed org info
              const { data: orgDetail } = await this.octokit.rest.orgs.get({
                org: org.login,
              });

              // Check if the GitHub App is installed
              const isInstalled = await this.checkAppInstallation(org.login);

              return {
                ...orgDetail,
                isInstalled,
                installationId: isInstalled ? this.installations[org.login] : null,
              };
            } catch (error) {
              console.error(`Error fetching details for org ${org.login}:`, error);
              return {
                ...org,
                isInstalled: false,
                installationId: null,
              };
            }
          })
        );

        this.organizations = detailedOrgs;
        this.lastFetchTime = Date.now();
        this.saveToLocalStorage();

        return this.organizations;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Check if GitHub App is installed for an organization
    async checkAppInstallation(orgName) {
      try {
        const response = await this.octokit.rest.apps.getOrgInstallation({
          org: orgName,
        });
        this.installations[orgName] = response.data.id;
        return true;
      } catch (error) {
        return false;
      }
    },

    // Initialize GitHub App for an organization
    async initializeApp(orgName) {
      try {
        this.isLoading = true;
        const appName = import.meta.env.VITE_GITHUB_APP_NAME;
        const installUrl = `https://github.com/apps/${appName}/installations/new`;
        window.location.href = installUrl;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Set selected organization
    setSelectedOrg(org) {
      this.selectedOrg = org;
      localStorage.setItem(SELECTED_ORG_KEY, JSON.stringify(org));
      if (org) {
        this.fetchOrgRepositories(org.login);
      }
    },

    // Fetch repositories for an organization
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
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Save data to localStorage
    saveToLocalStorage() {
      localStorage.setItem(
        ORGS_STORAGE_KEY,
        JSON.stringify({
          organizations: this.organizations,
          timestamp: Date.now(),
        })
      );
    },

    // Load data from localStorage
    loadFromLocalStorage() {
      const stored = localStorage.getItem(ORGS_STORAGE_KEY);
      const storedOrg = localStorage.getItem(SELECTED_ORG_KEY);

      if (stored) {
        const data = JSON.parse(stored);
        if (Date.now() - data.timestamp < 5 * 60 * 1000) {
          this.organizations = data.organizations;
          this.lastFetchTime = data.timestamp;
        }
      }

      if (storedOrg) {
        this.selectedOrg = JSON.parse(storedOrg);
      }
    },

    // Clear store state
    clearState() {
      this.organizations = [];
      this.selectedOrg = null;
      this.orgRepositories = {};
      this.error = null;
      this.lastFetchTime = null;
      this.octokit = null;
      this.installations = {};
      localStorage.removeItem(ORGS_STORAGE_KEY);
      localStorage.removeItem(SELECTED_ORG_KEY);
    },

    // Clear error
    clearError() {
      this.error = null;
    },
  },
});
