// stores/githubAppStore.js
import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "../auth";
export const useGithubAppStore = defineStore("githubApp", {
  state: () => ({
    installations: {},
    isLoading: false,
    error: null,
    installationWindow: null,
    checkWindowInterval: null,
  }),

  getters: {
    getInstallations: state => state.installations,
    isInstallationsLoading: state => state.isLoading,
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

        const response = await axios.post("/github/install", {
          user_id: authStore.user.userId,
          installation_id: installationId,
          setup_action: setupAction,
        });

        console.log("Installation response:", response.data);

        if (response.data.success) {
          const resData = response.data.data;

          this.installation[resData.id] = resData;
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
      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const response = await axios.get(`/github/install/users/${authStore.user.userId}`);

        if (response.data.success) {
          // Process installations to remove duplicates
          const resData = response.data.data;

          resData.forEach(element => {
            this.installations[element.id] = { ...element };
          });
        }
      } catch (error) {
        console.error("Error fetching GitHub installations:", error);
        this.error = error.response?.data?.error || "Failed to fetch installations";
      } finally {
        this.isLoading = false;
      }
    },

    clearInstallations() {
      this.installations = [];
      this.error = null;
    },
    openInstallationWindow() {
      // Save project ID for installation callback

      const installUrl = `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new`;
      const callbackUrl = `${window.location.origin}/github/callback`;

      // Add target_type=user parameter to the URL
      const params = new URLSearchParams({
        callback_url: callbackUrl,
        target_type: "user",
      });

      const fullUrl = `${installUrl}?${params.toString()}`;

      const width = 1020;
      const height = 618;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      const popupWindow = window.open(fullUrl, "Install GitHub App", `width=${width},height=${height},top=${top},left=${left}`);

      if (this.checkWindowInterval) {
        clearInterval(this.checkWindowInterval);
      }
      this.checkWindowInterval = setInterval(() => {
        try {
          if (!popupWindow || popupWindow.closed) {
            this.cleanup();
          }
        } catch (e) {
          console.error(e);
        }
      }, 500);
    },
    cleanup() {
      if (this.checkWindowInterval) {
        clearInterval(this.checkWindowInterval);
        this.checkWindowInterval = null;
      }
    },
  },
});
