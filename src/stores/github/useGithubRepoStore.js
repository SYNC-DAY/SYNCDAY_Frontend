// stores/useGithubRepoStore.js
import { defineStore } from 'pinia';
import { useGithubAuthStore } from './useGithubAuthStore';

export const useGithubRepoStore = defineStore('githubRepo', {
  state: () => ({
    repositories: JSON.parse(localStorage.getItem('github_repositories')) || [],
    isLoading: false,
    error: null
  }),

  getters: {
    allRepositories: (state) => state.repositories,
    publicReposCount: (state) => state.repositories.length,
    hasError: (state) => !!state.error
  },

  actions: {
    async fetchUserRepos() {
      const authStore = useGithubAuthStore();
      if (!authStore.accessToken) {
        throw new Error('No access token available');
      }

      this.isLoading = true;
      
      try {
        const response = await fetch('https://api.github.com/user/repos', {
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch repositories');
        }
        
        this.repositories = await response.json();
        this.saveToLocalStorage();
        return this.repositories;
      } catch (error) {
        console.error('Error fetching repositories:', error);
        this.error = error.message || 'An error occurred while fetching repositories';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('github_repositories', JSON.stringify(this.repositories));
    },

    clearRepositories() {
      this.repositories = [];
      localStorage.removeItem('github_repositories');
    },

    clearError() {
      this.error = null;
    }
  }
});