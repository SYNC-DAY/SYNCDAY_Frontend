// stores/github/useGithubOrgStore.js
import { defineStore } from "pinia";
import { useGithubAuthStore } from "./useGithubAuthStore";
import axios from "axios";

const ORGS_STORAGE_KEY = "github_organizations";
const SELECTED_ORG_KEY = "github_selected_org";

export const useGithubOrgStore = defineStore("githubOrg", {
  state: () => ({
    organizations: JSON.parse(localStorage.getItem(ORGS_STORAGE_KEY) || "[]"),
    selectedOrg: JSON.parse(localStorage.getItem(SELECTED_ORG_KEY) || "null"),
    isLoading: false,
    error: null,
    lastFetchTime: null,
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
  },

  actions: {
    async fetchOrganizations(forceRefresh = false) {
      try {
        const authStore = useGithubAuthStore();
        if (!authStore.accessToken) {
          throw new Error("No access token available");
        }

        // Return cached data if available and recent
        if (!forceRefresh && !this.shouldRefetch && this.organizations.length > 0) {
          return this.organizations;
        }

        this.isLoading = true;

        // Fetch user's organizations
        const response = await fetch("https://api.github.com/user/orgs", {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        // Fetch detailed information for each organization
        const detailedOrgs = await Promise.all(
          response.data.map(async org => {
            try {
              // Get detailed org info
              const orgDetailResponse = await fetch(`https://api.github.com/orgs/${org.login}`, {
                headers: {
                  Authorization: `Bearer ${authStore.accessToken}`,
                  Accept: "application/vnd.github.v3+json",
                },
              });

              // Get user's membership status in the org
              const membershipResponse = await fetch(`https://api.github.com/user/memberships/orgs/${org.login}`, {
                headers: {
                  Authorization: `Bearer ${authStore.accessToken}`,
                  Accept: "application/vnd.github.v3+json",
                },
              });

              // Check if the GitHub App is installed for this organization

              return {
                ...orgDetailResponse.data,
                membershipRole: membershipResponse.data.role,
              };
            } catch (error) {
              console.error(`Error fetching details for org ${org.login}:`, error);
              // Return basic org info if detailed fetch fails
              return {
                ...org,
                membershipRole: "member",
                isInstalled: false,
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
