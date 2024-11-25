
// stores/github/useGithubOrgStore.js
import { defineStore } from 'pinia';
import { useGithubAuthStore } from './useGithubAuthStore';
import { useGithubBaseFetch } from './useGithubBaseStore';

export const useGithubOrgStore = defineStore('githubOrg', {
  state: () => ({
    organizations: [],
    selectedOrg: null,
    orgRepositories: {},
    isLoading: false,
    error: null
  }),

  getters: {
    allOrganizations: (state) => state.organizations,
    currentOrg: (state) => state.selectedOrg,
    hasError: (state) => !!state.error,
    getOrgRepositories: (state) => (orgName) => state.orgRepositories[orgName] || []
  },

  actions: {
    async fetchOrganizations() {
      const authStore = useGithubAuthStore();
      const { fetchGithub } = useGithubBaseFetch();

      if (!authStore.accessToken) {
        throw new Error('No access token available');
      }

      this.isLoading = true;
      
      try {
        // Fetch organizations list
        const orgs = await fetchGithub('/user/orgs', {
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`
          }
        });

        // Fetch detailed information for each organization
        const orgsWithDetails = await Promise.all(
          orgs.map(org => 
            fetchGithub(`/orgs/${org.login}`, {
              headers: {
                'Authorization': `Bearer ${authStore.accessToken}`
              }
            })
          )
        );

        this.organizations = orgsWithDetails;
        return this.organizations;
      } catch (error) {
        console.error('Error fetching organizations:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOrgRepositories(orgName) {
      const authStore = useGithubAuthStore();
      const { fetchGithub } = useGithubBaseFetch();

      if (!authStore.accessToken) {
        throw new Error('No access token available');
      }

      this.isLoading = true;
      
      try {
        const repos = await fetchGithub(`/orgs/${orgName}/repos`, {
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`
          }
        });
        
        this.orgRepositories[orgName] = repos;
        return repos;
      } catch (error) {
        console.error('Error fetching organization repositories:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setSelectedOrg(org) {
      this.selectedOrg = org;
      if (org) {
        this.fetchOrgRepositories(org.login);
      }
    },

    clearState() {
      this.organizations = [];
      this.selectedOrg = null;
      this.orgRepositories = {};
      this.error = null;
    },

    clearError() {
      this.error = null;
    }
  }
});
