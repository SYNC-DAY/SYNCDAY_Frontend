import { defineStore } from "pinia";
import { useGithubAuthStore } from "./useGithubAuthStore";
import { Octokit } from "@octokit/rest";

const ORGS_STORAGE_KEY = "github_organizations";
const SELECTED_ORG_KEY = "github_selected_org";
const USER_INFO_KEY = "github_user_info";

export const useGithubOrgStore = defineStore("githubOrg", {
  state: () => ({
    organizations: JSON.parse(localStorage.getItem(ORGS_STORAGE_KEY) || "[]"),
    selectedOrg: JSON.parse(localStorage.getItem(SELECTED_ORG_KEY) || "null"),
    orgRepositories: {},
    isLoading: false,
    error: null,
    lastFetchTime: null,
    octokit: null,
    installationStatus: {},
  }),

  getters: {
    allOrganizations: state => state.organizations,
    currentOrg: state => state.selectedOrg,
    hasError: state => !!state.error,
    getOrgRepositories: state => orgName => state.orgRepositories[orgName] || [],
    shouldRefetch: state => {
      if (!state.lastFetchTime) return true;
      return Date.now() - state.lastFetchTime > 5 * 60 * 1000;
    },
    getInstallationStatus: state => orgLogin => state.installationStatus[orgLogin] || null,
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
    // Add methods to check installation status
    async checkInstallation(orgName) {
      try {
        if (!this.octokit) {
          this.initializeOctokit();
        }
        const { data: installations } = await this.octokit.rest.apps.getOrgInstallation({
          org: orgName,
        });
        return true;
      } catch (error) {
        if (error.status === 404) {
          return false;
        }
        throw error;
      }
    },

    async fetchOrganizations(forceRefresh = false) {
      try {
        if (!forceRefresh && !this.shouldRefetch && this.organizations.length > 0) {
          return this.organizations;
        }

        this.isLoading = true;
        const authStore = useGithubAuthStore();

        // Fetch organizations using user's access token
        const response = await fetch("https://api.github.com/user/orgs", {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }

        const orgs = await response.json();
        console.log("Fetched orgs:", orgs);

        // Get detailed information for each organization
        const detailedOrgs = await Promise.all(
          orgs.map(async org => {
            try {
              // Get organization details
              const orgResponse = await fetch(`https://api.github.com/orgs/${org.login}`, {
                headers: {
                  Authorization: `Bearer ${authStore.accessToken}`,
                  Accept: "application/vnd.github.v3+json",
                  "X-GitHub-Api-Version": "2022-11-28",
                },
              });

              // Get user's membership in the organization
              const membershipResponse = await fetch(`https://api.github.com/user/memberships/orgs/${org.login}`, {
                headers: {
                  Authorization: `Bearer ${authStore.accessToken}`,
                  Accept: "application/vnd.github.v3+json",
                  "X-GitHub-Api-Version": "2022-11-28",
                },
              });

              const [orgData, membershipData] = await Promise.all([orgResponse.ok ? orgResponse.json() : org, membershipResponse.ok ? membershipResponse.json() : { role: "member" }]);

              // Check installation status
              const installationStatus = await this.checkInstallationStatus(org.login);

              return {
                ...orgData,
                membershipRole: membershipData.role,
                installationStatus,
              };
            } catch (error) {
              console.error(`Error fetching details for org ${org.login}:`, error);
              return {
                ...org,
                membershipRole: "member",
                installationStatus: null,
              };
            }
          })
        );

        this.organizations = detailedOrgs;
        this.lastFetchTime = Date.now();
        this.saveToLocalStorage();

        return this.organizations;
      } catch (error) {
        console.error("Error fetching organizations:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
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
