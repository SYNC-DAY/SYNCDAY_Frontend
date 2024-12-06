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
    async handleInstallationCallback(installationId, setupAction) {
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();

      try {
        console.log("Installation callback payload:", {
          user_id: authStore.user.userId,
          installation_id: installationId,
          setup_action: setupAction,
        });

        const response = await axios.post("/github/install/", {
          user_id: authStore.user.userId,
          installation_id: installationId,
          setup_action: setupAction,
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

    async fetchInstallations() {
      try {
        const authStore = useAuthStore();
        const response = await axios.get(`/github/install/${authStore.user.userId}`);

        if (response.data.success) {
          const data = response.data.data;
          console.log(data);
        }
      } catch (error) {}
    },
  },
});
