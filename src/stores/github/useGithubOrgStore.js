// stores/github/useGithubOrgStore.js
import { defineStore } from "pinia";
import { useGithubAuthStore } from "./useGithubAuthStore";
import axios from "axios";
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
    // Add installation status tracking
    installationStatus: {},
  }),

  getters: {
    allOrganizations: state => state.organizations,
    currentOrg: state => state.selectedOrg,
    hasError: state => !!state.error,
    shouldRefetch: state => {
      if (!state.lastFetchTime) return true;
      // Refetch if last fetch was more than 5 minutes ago
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
    // New method to check installation status
    async checkInstallationStatus(orgLogin) {
      try {
        if (!this.octokit) {
          this.initializeOctokit();
        }

        const response = await this.octokit.request("GET", `/orgs/${orgLogin}/installation`, {
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        this.installationStatus[orgLogin] = response.data;
        return response.data;
      } catch (error) {
        if (error.status === 404) {
          // App is not installed
          this.installationStatus[orgLogin] = null;
          return null;
        }
        console.error(`Error checking installation status for ${orgLogin}:`, error);
        throw error;
      }
    },
    async fetchOrganizations(forceRefresh = false) {
      try {
        if (!this.octokit) {
          this.initializeOctokit();
        }

        if (!forceRefresh && !this.shouldRefetch && this.organizations.length > 0) {
          return this.organizations;
        }

        this.isLoading = true;

        const { data: orgs } = await this.octokit.rest.orgs.listForAuthenticatedUser();
        console.log("Fetched orgs:", orgs);

        // Check installation status for each organization
        const detailedOrgs = await Promise.all(
          orgs.map(async org => {
            try {
              const [orgDetail, membership, installationStatus] = await Promise.all([
                this.octokit.rest.orgs
                  .get({ org: org.login })
                  .then(response => response.data)
                  .catch(() => org),
                this.octokit.rest.orgs
                  .getMembershipForAuthenticatedUser({ org: org.login })
                  .then(response => response.data)
                  .catch(() => ({ role: "member" })),
                this.checkInstallationStatus(org.login),
              ]);

              return {
                ...orgDetail,
                membershipRole: membership.role,
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

    setSelectedOrg(org) {
      this.selectedOrg = org;
      localStorage.setItem(SELECTED_ORG_KEY, JSON.stringify(org));
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
        // Only use cached data if less than 5 minutes old
        if (Date.now() - data.timestamp < 5 * 60 * 1000) {
          this.organizations = data.organizations;
          this.lastFetchTime = data.timestamp;
        }
      }
    },

    clearState() {
      this.organizations = [];
      this.selectedOrg = null;
      this.error = null;
      this.lastFetchTime = null;
      localStorage.removeItem(ORGS_STORAGE_KEY);
      localStorage.removeItem(SELECTED_ORG_KEY);
    },
  },
});
