import { defineStore } from "pinia";
import { useGithubAuthStore } from "./useGithubAuthStore";

const ORGS_STORAGE_KEY = "github_organizations";
const SELECTED_ORG_KEY = "github_selected_org";

export const useGithubOrgStore = defineStore("githubOrg", {
  state: () => ({
    organizations: [],
    selectedOrg: JSON.parse(localStorage.getItem(SELECTED_ORG_KEY) || "null"),
    isLoading: false,
    error: null,
  }),

  getters: {
    allOrganizations: state => state.organizations,
    currentOrg: state => state.selectedOrg,
  },

  actions: {
    async fetchOrganizations() {
      try {
        const authStore = useGithubAuthStore();
        if (!authStore.accessToken) {
          throw new Error("No access token available");
        }

        this.isLoading = true;

        const response = await fetch("https://api.github.com/user/orgs", {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch organizations: ${response.statusText}`);
        }

        this.organizations = await response.json();

        // Save to localStorage
        localStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(this.organizations));

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

    clearState() {
      this.organizations = [];
      this.selectedOrg = null;
      this.error = null;
      localStorage.removeItem(ORGS_STORAGE_KEY);
      localStorage.removeItem(SELECTED_ORG_KEY);
    },
  },
});
