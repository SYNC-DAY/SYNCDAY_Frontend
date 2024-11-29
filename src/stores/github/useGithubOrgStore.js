import { defineStore } from 'pinia';
import { useGithubAuthStore } from './useGithubAuthStore';

const ORGS_STORAGE_KEY = 'github_organizations';
const SELECTED_ORG_KEY = 'github_selected_org';
const USER_INFO_KEY = 'github_user_info';

export const useGithubOrgStore = defineStore('githubOrg', {
  state: () => ({
    organizations: JSON.parse(localStorage.getItem(ORGS_STORAGE_KEY) || '[]'),
    selectedOrg: JSON.parse(localStorage.getItem(SELECTED_ORG_KEY) || 'null'),
    orgRepositories: {},
    isLoading: false,
    error: null,
    lastFetchTime: null
  }),

  getters: {
    allOrganizations: (state) => state.organizations,
    currentOrg: (state) => state.selectedOrg,
    hasError: (state) => !!state.error,
    getOrgRepositories: (state) => (orgName) => state.orgRepositories[orgName] || [],
    shouldRefetch: (state) => {
      if (!state.lastFetchTime) return true;
      return Date.now() - state.lastFetchTime > 5 * 60 * 1000;
    },
    getUserInfo: () => {
      const userInfoStr = localStorage.getItem(USER_INFO_KEY);
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    }
  },

  actions: {
    async fetchOrganizations(forceRefresh = false) {
      const authStore = useGithubAuthStore();
      const userInfo = this.getUserInfo;
      
      if (!authStore.accessToken) {
        throw new Error('No access token available');
      }

      if (!userInfo) {
        throw new Error('User info not found in localStorage');
      }

      if (!forceRefresh && !this.shouldRefetch && this.organizations.length > 0) {
        return this.organizations;
      }

      this.isLoading = true;
      
      try {
        // Fetch organizations list using userInfo from localStorage
        const orgsResponse = await fetch(
          `https://api.github.com/users/${userInfo.login}/orgs`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (!orgsResponse.ok) {
          throw new Error(`HTTP error! status: ${orgsResponse.status}`);
        }
        
        const orgs = await orgsResponse.json();
        console.log(orgs)
        // Fetch detailed information for each organization
        const detailedOrgs = await Promise.all(
          orgs.map(async (org) => {
            const detailResponse = await fetch(
              `https://api.github.com/orgs/${org.login}`,
              {
                headers: {
                  'Authorization': `Bearer ${authStore.accessToken}`,
                  'Accept': 'application/vnd.github.v3+json'
                }
              }
            );

            if (!detailResponse.ok) {
              throw new Error(`Failed to fetch details for ${org.login}`);
            }

            const detailData = await detailResponse.json();
            return {
              ...detailData,
              _lastFetched: Date.now(),
              _userId: userInfo.login
            };
          })
        );

        this.organizations = detailedOrgs;
        this.lastFetchTime = Date.now();
        this.saveToLocalStorage();
        
        return this.organizations;

      } catch (error) {
        console.error('Error fetching organizations:', error);
        this.error = error.message;
        
        if (error.status === 404) {
          this.error = `User ${userInfo.login} not found`;
        } else if (error.status === 403) {
          this.error = 'Rate limit exceeded or access denied';
        }
        
        throw new Error(this.error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOrgRepositories(orgName) {
      const authStore = useGithubAuthStore();
      const userInfo = this.getUserInfo;
      
      if (!authStore.accessToken) {
        throw new Error('No access token available');
      }

      this.isLoading = true;
      
      try {
        const response = await fetch(
          `https://api.github.com/users/${userInfo.login}/orgs`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const repos = await response.json();
        console.log(repos)
        this.orgRepositories[orgName] = repos.map(repo => ({
          ...repo,
          _lastFetched: Date.now(),
          _userId: userInfo?.login
        }));
        
        return this.orgRepositories[orgName];
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
      const userInfo = this.getUserInfo;
      localStorage.setItem(SELECTED_ORG_KEY, JSON.stringify({
        ...org,
        _userId: userInfo?.login
      }));
      if (org) {
        this.fetchOrgRepositories(org.login);
      }
    },

    saveToLocalStorage() {
      const userInfo = this.getUserInfo;
      localStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify({
        organizations: this.organizations,
        userId: userInfo?.login,
        timestamp: Date.now()
      }));
    },

    loadFromLocalStorage() {
      const stored = localStorage.getItem(ORGS_STORAGE_KEY);
      const userInfo = this.getUserInfo;
      
      if (stored && userInfo) {
        const data = JSON.parse(stored);
        if (data.userId === userInfo.login && 
            Date.now() - data.timestamp < 5 * 60 * 1000) {
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
      localStorage.removeItem(ORGS_STORAGE_KEY);
      localStorage.removeItem(SELECTED_ORG_KEY);
    },

    clearError() {
      this.error = null;
    },

    hasOrganization(orgLogin) {
      return this.organizations.some(org => org.login === orgLogin);
    },

    getOrganization(orgLogin) {
      return this.organizations.find(org => org.login === orgLogin);
    }
  }
});