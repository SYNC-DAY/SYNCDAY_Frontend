// stores/useGithubAppAuthStore.js
import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAppAuthStore = defineStore("githubAppAuth", {
  state: () => ({
    appToken: null, // GitHub App의 JWT 토큰
    installationToken: null, // Installation 토큰
    userInfo: null,
    organizations: [],
    projects: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: state => !!state.installationToken,
    username: state => state.userInfo?.login,
    avatarUrl: state => state.userInfo?.avatar_url,
    hasError: state => !!state.error,
    getOrganizations: state => state.organizations,
    getProjects: state => state.projects,
  },

  actions: {
    async initializeApp() {
      try {
        // 백엔드에서 GitHub App JWT 토큰 발급
        const response = await axios.get("api/github/app-token");
        this.appToken = response.data.token;
      } catch (error) {
        console.error("Failed to initialize GitHub App:", error);
        this.error = error.message;
        throw error;
      }
    },

    async authenticateInstallation(installationId) {
      this.isLoading = true;
      try {
        // 백엔드를 통해 installation 토큰 발급
        const response = await axios.get(`api/github/installation-token/${installationId}`, {
          headers: {
            Authorization: `Bearer ${this.appToken}`,
          },
        });

        this.installationToken = response.data.token;
        await this.fetchUserInfo();
        return true;
      } catch (error) {
        console.error("Installation auth error:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserInfo() {
      if (!this.installationToken) {
        throw new Error("No installation token available");
      }

      this.isLoading = true;
      try {
        const response = await axios.get("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${this.installationToken}`,
            Accept: "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        this.userInfo = response.data;
        return this.userInfo;
      } catch (error) {
        console.error("Error fetching user info:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserOrganizations() {
      if (!this.installationToken) {
        throw new Error("No installation token available");
      }

      this.isLoading = true;
      try {
        const response = await axios.get("https://api.github.com/user/orgs", {
          headers: {
            Authorization: `Bearer ${this.installationToken}`,
            Accept: "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        // 각 조직에 대해 GitHub App 설치 상태 확인
        const orgsWithInstallation = await Promise.all(
          response.data.map(async org => {
            try {
              const installationResponse = await axios.get(`https://api.github.com/orgs/${org.login}/installation`, {
                headers: {
                  Authorization: `Bearer ${this.appToken}`,
                  Accept: "application/vnd.github.v3+json",
                  "X-GitHub-Api-Version": "2022-11-28",
                },
              });

              return {
                ...org,
                installation: {
                  id: installationResponse.data.id,
                  installed: true,
                },
              };
            } catch (error) {
              return {
                ...org,
                installation: {
                  installed: false,
                },
              };
            }
          })
        );

        this.organizations = orgsWithInstallation;
        return this.organizations;
      } catch (error) {
        console.error("Error fetching organizations:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOrganizationProjects(orgName) {
      if (!this.installationToken) {
        throw new Error("No installation token available");
      }

      this.isLoading = true;
      try {
        const response = await axios.get(`https://api.github.com/orgs/${orgName}/projects`, {
          headers: {
            Authorization: `Bearer ${this.installationToken}`,
            Accept: "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        this.projects = response.data.map(project => ({
          id: project.id,
          name: project.name,
          body: project.body,
          state: project.state,
          htmlUrl: project.html_url,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          creator: {
            login: project.creator.login,
            avatarUrl: project.creator.avatar_url,
          },
        }));

        return this.projects;
      } catch (error) {
        console.error("Error fetching projects:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.appToken = null;
      this.installationToken = null;
      this.userInfo = null;
      this.organizations = [];
      this.projects = [];
      this.error = null;
    },

    clearError() {
      this.error = null;
    },
  },
});
