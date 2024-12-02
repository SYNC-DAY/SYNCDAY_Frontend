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

    async handleInstallationCallback(installationId) {
      this.isInstalling = true;
      this.error = null;

      try {
        // Call backend to complete installation
        const response = await axios.post("/api/github/installation/callback", {
          installationId,
          setupAction,
        });

        if (response.data.success) {
          this.installationId = installationId;

          // Get redirect path or default to home
          const redirectPath = localStorage.getItem("github_app_redirect") || "/";
          localStorage.removeItem("github_app_redirect");

          return redirectPath;
        } else {
          throw new Error("Failed to complete installation");
        }
      } catch (error) {
        console.error("Installation error:", error);
        this.error = error.message || "Installation failed";
        throw error;
      } finally {
        this.isInstalling = false;
      }
    },

    clearInstallation() {
      this.installationId = null;
      this.error = null;
    },
  },
});
