// stores/useGithubBranchStore.js
import { defineStore } from 'pinia';
import { useGithubAuthStore } from './useGithubAuthStore';
import axios from 'axios';

export const useGithubBranchStore = defineStore('githubBranch', {
  state: () => ({
    branches: [],
    selectedRepo: null,
    selectedBranch: '',
    isLoading: false,
    error: null
  }),

  getters: {
    allBranches: (state) => state.branches,
    currentRepo: (state) => state.selectedRepo,
    currentBranch: (state) => state.selectedBranch,
    hasError: (state) => !!state.error
  },

  actions: {
    async fetchBranches(repo) {
      const authStore = useGithubAuthStore();
      if (!authStore.accessToken) {
        throw new Error('No access token available');
      }

      this.isLoading = true;
      
      try {
        const branchesUrl = repo.branches_url.replace('{/branch}', '');
        const response = await axios.get(branchesUrl, {
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        this.branches = response.data;
        return this.branches;
      } catch (error) {
        console.error('Error fetching branches:', error);
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setSelectedRepo(repo) {
      this.selectedRepo = repo;
      this.selectedBranch = '';
      if (repo) {
        this.fetchBranches(repo);
      }
    },

    setSelectedBranch(branchName) {
      this.selectedBranch = branchName;
    },

    clearState() {
      this.branches = [];
      this.selectedRepo = null;
      this.selectedBranch = '';
      this.error = null;
    },

    clearError() {
      this.error = null;
    }
  }
});