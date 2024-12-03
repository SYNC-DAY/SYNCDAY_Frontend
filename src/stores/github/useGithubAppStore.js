// stores/github/useGithubAppStore.js
import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAppStore = defineStore("githubApp", {
  state: () => ({
    isInstalled: false,
    installationId: null,
    selectedOrg: null,
    organizations: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    hasSelectedOrg: state => !!state.selectedOrg,
    getOrganizations: state => state.organizations,
    getInstallationStatus: state => state.isInstalled,
    hasError: state => !!state.error,
  },

  actions: {
    async checkInstallation() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.get("/api/github/installation/check");
        this.isInstalled = response.data.success;
        this.installationId = response.data.installationId;

        if (this.isInstalled) {
          await this.fetchOrganizations();
        }

        return this.isInstalled;
      } catch (error) {
        console.error("Installation check failed:", error);
        this.error = error.response?.data?.message || "Failed to check installation status";
        this.isInstalled = false;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async redirectToInstallation() {
      const clientId = import.meta.env.VITE_GITHUB_APP_CLIENT_ID;
      const redirectUrl = import.meta.env.VITE_GITHUB_APP_REDIRECT_URL;

      window.location.href = `https://github.com/apps/${clientId}/installations/new?state=new_installation&redirect_uri=${redirectUrl}`;
    },

    async fetchOrganizations() {
      if (!this.isInstalled) {
        throw new Error("GitHub App is not installed");
      }

      this.isLoading = true;

      try {
        const response = await axios.get("/api/github/organizations");
        this.organizations = response.data.data;
        return this.organizations;
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
        this.error = error.response?.data?.message || "Failed to fetch organizations";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async selectOrganization(org) {
      if (!org) {
        throw new Error("Organization is required");
      }

      this.isLoading = true;

      try {
        const response = await axios.post("/api/github/organization/select", {
          organizationId: org.id,
          installationId: this.installationId,
        });

        if (response.data.success) {
          this.selectedOrg = org;
          return true;
        }
        throw new Error("Failed to select organization");
      } catch (error) {
        console.error("Failed to select organization:", error);
        this.error = error.response?.data?.message || "Failed to select organization";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async handleCallbackUrl(code, state) {
      if (!code) {
        throw new Error("Authorization code is required");
      }

      this.isLoading = true;

      try {
        const response = await axios.get(`/api/github/installation/callback?code=${code}&state=${state}`);

        if (response.data.success) {
          this.isInstalled = true;
          this.installationId = response.data.installationId;
          await this.fetchOrganizations();
          return true;
        }
        throw new Error("Failed to handle installation callback");
      } catch (error) {
        console.error("Failed to handle callback:", error);
        this.error = error.response?.data?.message || "Failed to complete installation";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    reset() {
      this.isInstalled = false;
      this.installationId = null;
      this.selectedOrg = null;
      this.organizations = [];
      this.error = null;
    },
  },
});
