// stores/githubAuth.js
import { defineStore } from "pinia";
import axios from "axios";
export const useGithubAuthStore = defineStore("githubAuth", {
  state: () => ({
    installationId: null,
    accountId: null,
    accountLogin: "",
    repositorySelection: "",
    targetType: "",
    targetId: null,
    permissions: {},
    isInstalled: false,
  }),

  actions: {
    saveInstallationInfo(installationData) {
      this.installationId = installationData.installationId;
      this.accountId = installationData.accountId;
      this.accountLogin = installationData.accountLogin;
      this.repositorySelection = installationData.repositorySelection;
      this.targetType = installationData.targetType;
      this.targetId = installationData.targetId;
      this.permissions = installationData.permissions;
      this.isInstalled = true;
    },

    clearInstallationInfo() {
      this.installationId = null;
      this.accountId = null;
      this.accountLogin = "";
      this.repositorySelection = "";
      this.targetType = "";
      this.targetId = null;
      this.permissions = {};
      this.isInstalled = false;
    },

    async checkInstallationStatus(userId) {
      try {
        console.log("Starting VCS check for userId:", userId);

        const response = await axios.get("/vcs/user/check", {
          params: {
            userId: userId,
            vcsType: "GITHUB",
          },
          headers: {
            "X-Request-ID": `vcs-check-${Date.now()}`,
          },
          timeout: 5000,
        });

        console.log("VCS check response:", {
          status: response.status,
          data: response.data,
        });

        return response.data;
      } catch (error) {
        const errorDetails = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          requestParams: {
            userId,
            vcsType: "GITHUB",
          },
        };

        console.error("VCS check failed:", errorDetails);

        if (error.response) {
          switch (error.response.status) {
            case 400:
              throw new Error("Invalid parameters. Check userId and vcsType.");
            case 401:
              throw new Error("Authentication failed.");
            case 404:
              throw new Error("VCS integration endpoint not found.");
            default:
              throw new Error(`VCS check failed: ${error.response.data?.message || error.message}`);
          }
        }

        throw error;
      }
    },

    async processInstallation(installationId) {
      try {
        const response = await fetch("/api/vcs/github/installation/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ installationId }),
        });

        const data = await response.json();

        if (data.success) {
          this.saveInstallationInfo(data.installationData);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error processing installation:", error);
        return false;
      }
    },
  },

  getters: {
    isGithubInstalled: state => state.isInstalled,
    getInstallationDetails: state => ({
      installationId: state.installationId,
      accountLogin: state.accountLogin,
      targetType: state.targetType,
      permissions: state.permissions,
    }),
  },
});
