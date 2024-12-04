// stores/github/useGithubAppStore.js
import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "../auth";
export const useGithubAppStore = defineStore("githubApp", {
  state: () => ({
    installations: new Map(), // Map to store installations by installationId
    isLoading: false,
    error: null,
  }),

  getters: {
    hasInstallation: state => installationId => {
      return state.installations.has(installationId);
    },

    getAllInstallations: state => {
      return Array.from(state.installations);
    },
  },

  actions: {
    async handleInstallationCallback(projectId, installationId) {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();

      try {
        console.log("Installation callback payload:", {
          vcs_type: "GITHUB",
          user_id: authStore.user.userId,
          installation_id: installationId,
          proj_id: projectId,
        });

        const response = await axios.post("/vcs/install", {
          vcs_type: "GITHUB",
          user_id: authStore.user.userId,
          installation_id: installationId,
          proj_id: projectId,
        });

        console.log("Installation response:", response.data);

        if (response.data.success) {
          this.installationId = installationId;
          localStorage.setItem("github_installation_id", installationId);
          return true;
        }
        throw new Error("Installation failed");
      } catch (error) {
        console.error("Installation error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        this.error = error.response?.data?.message || "Installation failed";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProjectInstallation(installationId) {
      if (!installationId) return;

      // If we already have this installation cached, return early
      if (this.installations.has(installationId)) {
        return this.installations.get(installationId);
      }

      this.isLoading = true;
      this.error = null;

      try {
        console.log(installationId);
        const response = await axios.get(`/vcs/installations/${installationId}`);

        if (response.data.success) {
          const installation = response.data.data;
          this.installations.set(installationId, installation);
          return installation;
        } else {
          throw new Error(response.data.error || "Failed to fetch installation");
        }
      } catch (error) {
        console.error("Error fetching GitHub installation:", error);
        this.error = error.message || "An error occurred while fetching installation";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMultipleInstallations(installationIds) {
      const uniqueIds = [...new Set(installationIds)].filter(id => id && !this.installations.has(id));

      if (uniqueIds.length === 0) return;

      this.isLoading = true;

      try {
        await Promise.all(uniqueIds.map(id => this.fetchProjectInstallation(id)));
      } finally {
        this.isLoading = false;
      }
    },

    clearInstallations() {
      this.installations.clear();
      this.error = null;
    },

    async fetchOrganizationProjects(installationId) {
      this.isLoading = true;
      try {
        const installation = this.getInstallationById(installationId);
        if (!installation) {
          throw new Error("no installation found");
        }
        const response = await axios.get(`vcs/installations/${installationId}/projects`);
        const responseData = response.data.data;
        console.log(responseData);
      } catch (error) {
        console.log(error);
      }
    },
    async fetchGithubInstallationToken(vcs_installation_id) {
      this.isLoading = true;
      try {
        let installation = this.getInstallationById(vcs_installation_id);
        if (!installation) {
          throw new Error("No installation found");
        }

        const response = await axios.get(`vcs/installations/${vcs_installation_id}/installation-token`);
        const { data: responseData } = response; // Fix: Correct destructuring of response

        if (responseData.success) {
          // Fix: Use the correct data structure from the response
          const token = responseData.data; // The token is in response.data
          console.log(token);
          // Update the installation with the new token

          installation = {
            ...installation,
            installation_token: token,
          };

          const updatedInstallation = { ...installation, installation_token: token };
          this.installations = {
            ...this.installations,
            [vcs_installation_id]: updatedInstallation,
          };
          // Fix: Use the correct vcs_installation_id variable

          return token;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch installation token:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    getInstallationById(installationId) {
      return this.installations.get(installationId);
    },
  },
});
