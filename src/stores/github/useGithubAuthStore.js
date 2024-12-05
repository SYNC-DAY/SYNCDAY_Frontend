// stores/githubAuthStore.js
import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAuthStore = defineStore("githubAuth", {
  state: () => ({
    hasGithubApp: false,
    loading: false,
    error: null,
    installationWindow: null,
    checkWindowInterval: null,
  }),

  actions: {
    async checkGithubAppInstallation() {
      this.loading = true;
      try {
        const response = await axios.get("/githuborg-member/check-githubapp-installation");

        if (response.success) {
          const res = response.data.data;
          console.log(res);
        }
        this.hasGithubApp = response.data.installed;
      } catch (error) {
        console.error("Failed to check GitHub App installation:", error);
        this.error = "Failed to check GitHub App installation status";
        this.hasGithubApp = false;
      } finally {
        this.loading = false;
      }
    },

    openInstallationWindow(projectId = null) {
      if (projectId) {
        localStorage.setItem("github_installation_project_id", projectId);
      }

      const installUrl = `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new`;
      const callbackUrl = `${window.location.origin}/github/callback`;
      const fullUrl = `${installUrl}?callback_url=${encodeURIComponent(callbackUrl)}`;

      const width = 1020;
      const height = 618;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      if (this.installationWindow) {
        this.installationWindow.close();
      }

      this.installationWindow = window.open(fullUrl, "Install GitHub App", `width=${width},height=${height},top=${top},left=${left}`);

      if (this.checkWindowInterval) {
        clearInterval(this.checkWindowInterval);
      }

      this.checkWindowInterval = setInterval(() => {
        if (this.installationWindow?.closed) {
          clearInterval(this.checkWindowInterval);
          this.checkWindowInterval = null;
          this.installationWindow = null;
          localStorage.removeItem("github_installation_project_id");
          // Refresh installation status after window closes
          this.checkGithubAppInstallation();
        }
      }, 500);
    },

    cleanup() {
      if (this.checkWindowInterval) {
        clearInterval(this.checkWindowInterval);
        this.checkWindowInterval = null;
      }
      if (this.installationWindow) {
        this.installationWindow.close();
        this.installationWindow = null;
      }
      localStorage.removeItem("github_installation_project_id");
    },
  },
});
