// stores/useGithubCommitStore.js
import { defineStore } from 'pinia';
import { useGithubAuthStore } from './useGithubAuthStore';
import axios from 'axios';

export const useGithubCommitStore = defineStore('githubCommit', {
  state: () => ({
    commits: [],
    isLoading: false,
    error: null
  }),

  getters: {
    allCommits: (state) => state.commits,
    hasError: (state) => !!state.error
  },

  actions: {
    async fetchCommits(repo, branchName) {
      const authStore = useGithubAuthStore();
      if (!authStore.accessToken) {
        throw new Error('No access token available');
      }

      this.isLoading = true;
      
      try {
        const commitsUrl = repo.commits_url.replace('{/sha}', '');
        const response = await axios.get(commitsUrl, {
          params: { sha: branchName },
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        this.commits = response.data;
        return this.commits;
      } catch (error) {
        console.error('Error fetching commits:', error);
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearState() {
      this.commits = [];
      this.error = null;
    },

    clearError() {
      this.error = null;
    }
  }
});