import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "../auth";

export const useGithubAppStore = defineStore("githubApp", {
  state: () => ({
    isInstalled: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    hasError: state => !!state.error,
    installationStatus: state => state.isInstalled,
  },

  actions: {
    async checkInstallation({ orgId, orgType, login }) {
      console.log("useGithubAppStore: checkInstallation");
      this.isLoading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const response = await axios.post("/vcs/install/check", {
          vcs_type: "GITHUB",
          user_id: authStore.user.userId,
          vcs_org_id: orgId,
          vcs_org_type: orgType,
          vcs_login: login,
        });

        if (response.data.success) {
          this.isInstalled = response.data.data;
          return this.isInstalled;
        } else {
          throw new Error(response.data.message || "Failed to check installation");
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        this.isInstalled = false;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.isInstalled = false;
      this.isLoading = false;
      this.error = null;
    },
  },
});
