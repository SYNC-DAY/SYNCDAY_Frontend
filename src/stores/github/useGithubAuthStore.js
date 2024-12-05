// stores/githubAuth.js
import { defineStore } from "pinia";

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

    async checkInstallationStatus() {
      try {
        const response = await fetch("/api/vcs/github/installation/status");
        const data = await response.json();

        if (data.installed) {
          this.saveInstallationInfo(data.installationData);
        } else {
          this.clearInstallationInfo();
        }

        return data.installed;
      } catch (error) {
        console.error("Error checking installation status:", error);
        this.clearInstallationInfo();
        return false;
      }
    },

    async processInstallation(code) {
      try {
        const response = await fetch("/api/vcs/github/installation/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
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
