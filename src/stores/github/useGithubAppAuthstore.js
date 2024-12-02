import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAppAuthStore = defineStore("githubAppAuth", {
  state: () => ({
    installationId: null,
    isInstalling: false,
    error: null,
  }),

  getters: {
    isInstalled: state => !!state.installationId,
    hasError: state => !!state.error,
  },

  actions: {
    async initiateInstallation() {
      const clientId = import.meta.env.VITE_GITHUB_APP_NAME;
      const redirectUri = import.meta.env.VITE_GITHUB_APP_REDIRECT_URI;

      // Save current path for redirect after installation
      localStorage.setItem("github_app_redirect", window.location.pathname + window.location.search);

      // Redirect to GitHub App installation
      window.location.href = `https://github.com/apps/${clientId}/installations/new`;
    },

    // In your store or component
    // In your store or component
    async handleInstallation(installationId, code) {
      try {
        const response = await axios({
          method: "POST",
          url: "/user/oauth2/github/installation",
          data: {
            installation_id: installationId,
            code: code,
            setup_action: "install", // If needed
          },
        });

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error("Failed to handle installation");
        }
      } catch (error) {
        console.error("Installation error:", error);
        throw error;
      }
    },

    clearInstallation() {
      this.installationId = null;
      this.error = null;
    },
  },
});
