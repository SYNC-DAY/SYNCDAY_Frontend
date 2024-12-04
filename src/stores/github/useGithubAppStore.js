// stores/github/useGithubAppStore.js
import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "../auth";

export const useGithubAppStore = defineStore("githubApp", {
  state: () => ({
    // Map to store installation info by project ID
    projectInstallations: JSON.parse(localStorage.getItem("github_project_installations") || "{}"),
    installations: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getProjectInstallation: state => projectId => {
      return state.projectInstallations[projectId] || null;
    },

    isProjectInstalled: state => projectId => {
      return !!state.projectInstallations[projectId];
    },

    hasError: state => !!state.error,
  },

  actions: {
    async handleInstallationCallback(projectId, installationId) {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();

      try {
        console.log("Installation callback payload:", {
          projectId,
          installationId,
          userId: authStore.user.userId,
        });

        const response = await axios.post("/vcs/install", {
          vcs_type: "GITHUB",
          user_id: authStore.user.userId,
          installation_id: installationId,
          proj_id: projectId,
        });

        console.log("Installation response:", response.data);

        if (response.data.success) {
          // Save installation info for this project
          const installationInfo = {
            installationId,
            timestamp: Date.now(),
            orgName: response.data.orgName, // Assuming backend returns this
            repoName: response.data.repoName, // Assuming backend returns this
          };

          this.projectInstallations[projectId] = installationInfo;
          this.saveToLocalStorage();
          return true;
        }
        throw new Error("Installation failed");
      } catch (error) {
        console.error("Installation error:", error);
        this.error = error.response?.data?.message || "Installation failed";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async refreshInstallationToken(projectId) {
      const installation = this.getProjectInstallation(projectId);
      if (!installation?.installationId) {
        throw new Error("No installation ID available for this project");
      }

      try {
        console.log("Refreshing token for project:", projectId);
        const response = await axios.get(`/api/github/installation/${installation.installationId}/token`);

        console.log("Token refresh response:", response.data);

        if (response.data.success) {
          // Update installation info with new token
          this.projectInstallations[projectId] = {
            ...installation,
            token: response.data.token,
            tokenTimestamp: Date.now(),
          };
          this.saveToLocalStorage();
          return response.data.token;
        }
        throw new Error("Failed to get installation token");
      } catch (error) {
        console.error("Token refresh error:", error);
        this.error = error.response?.data?.message || "Token refresh failed";
        throw error;
      }
    },

    async fetchProjectInstallation(installationId) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.get(`/vcs/installations/${installationId}`);
        console.log("Fetch project installation response:", response.data);

        if (response.data.success) {
          this.projectInstallations[projectId] = {
            installationId: response.data.installationId,
            orgName: response.data.orgName,
            repoName: response.data.repoName,
            timestamp: Date.now(),
          };
          this.saveToLocalStorage();
        }
        return this.projectInstallations[projectId];
      } catch (error) {
        console.error("Error fetching project installation:", error);
        this.error = error.response?.data?.message || "Failed to fetch installation";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async removeProjectInstallation(projectId) {
      this.isLoading = true;
      this.error = null;

      try {
        await axios.delete(`/api/projects/${projectId}/github/installation`);
        delete this.projectInstallations[projectId];
        this.saveToLocalStorage();
      } catch (error) {
        console.error("Error removing project installation:", error);
        this.error = error.response?.data?.message || "Failed to remove installation";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    saveToLocalStorage() {
      localStorage.setItem("github_project_installations", JSON.stringify(this.projectInstallations));
    },

    clearError() {
      this.error = null;
    },

    reset() {
      console.log("Resetting GitHub App store state");
      this.projectInstallations = {};
      this.installations = [];
      this.error = null;
      localStorage.removeItem("github_project_installations");
    },
  },
});
