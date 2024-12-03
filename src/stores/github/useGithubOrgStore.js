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

    async fetchOrganizations(forceRefresh = false) {
      try {
        if (!this.octokit) {
          this.initializeOctokit();
        }

        // Return cached data if it's fresh enough
        // if (!forceRefresh && !this.shouldRefetch && this.organizations.length > 0) {
        //   return this.organizations;
        // }

        this.isLoading = true;
        // const { data: rateLimit } = await this.octokit.rest.rateLimit.get();
        // Fetch user's organizations using Octokit
        const { data: orgs } = await this.octokit.rest.orgs.listForAuthenticatedUser();
        const { data: user } = await this.octokit.rest.users.getAuthenticated();
        console.log(orgs);
        console.log("Authenticated User:", user);

        const response = await this.octokit.rest.users.getAuthenticated();

        const _orgs = await this.octokit.paginate(this.octokit.rest.orgs.listForAuthenticatedUser, {
          per_page: 100,
        });
        console.log("Organizations:", _orgs);
        // Fetch detailed information for each organization
        const detailedOrgs = await Promise.all(
          orgs.map(async org => {
            try {
              // Get detailed org info
              const { data: orgDetail } = await this.octokit.rest.orgs.get({
                org: org.login,
              });

              // Get user's membership status in the org
              const { data: membership } = await this.octokit.rest.orgs.getMembershipForAuthenticatedUser({
                org: org.login,
              });

              return {
                ...orgDetail,
                membershipRole: membership.role,
              };
            } catch (error) {
              console.error(`Error fetching details for org ${org.login}:`, error);
              // Return basic org info if detailed fetch fails
              return {
                ...org,
                membershipRole: "member",
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
