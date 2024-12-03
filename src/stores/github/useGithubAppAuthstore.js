import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAppAuthStore = defineStore("githubAppAuthStore", {
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
      const clientId = import.meta.env.VITE_GITHUB_APP_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_APP_REDIRECT_URI;

      // Save current path for redirect after installation
      localStorage.setItem("github_app_redirect", window.location.pathname + window.location.search);

      // Redirect to GitHub App installation
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
    },

    // In your store or component
    // In your store or component
    async handleInstallation(code) {
      try {
        const response = await axios({
          method: "POST",
          url: "/user/oauth2/github/access_token",
          data: {
            code: code,
            // setup_action: "install", // If needed
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
      this.error = null;
    },
  },
});
