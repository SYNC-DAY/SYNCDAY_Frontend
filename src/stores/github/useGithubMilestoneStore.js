import { defineStore } from "pinia";
import { useGithubAppStore } from "./useGithubAppStore";
import { Octokit } from "@octokit/rest";

export const useGithubMilestoneStore = defineStore("githubMilestoneStore", {
  state: () => ({
    milestones: {}, // { [installationId:owner:repo]: milestoneData[] }
    isLoading: false,
    isFetching: false,
    error: null,
    isInitialized: false,
    octokitInstances: {}, // { [installationId]: OctokitInstance }
  }),

  actions: {
    async getOctokitInstance(installationId) {
      try {
        const githubAppStore = useGithubAppStore();
        const installation = githubAppStore.installations[installationId];

        if (!installation?.access_token) {
          await githubAppStore.requestInstallationToken(installationId);
        }

        const updatedInstallation = githubAppStore.installations[installationId];

        if (!updatedInstallation?.access_token) {
          throw new Error("No access token available for this installation");
        }

        if (!this.octokitInstances[installationId]) {
          this.octokitInstances[installationId] = new Octokit({
            auth: updatedInstallation.access_token,
          });
        }

        return this.octokitInstances[installationId];
      } catch (error) {
        console.error("Failed to initialize Octokit:", error);
        throw new Error(`Failed to initialize GitHub client: ${error.message}`);
      }
    },

    async initializeStore(installationId, owner, repo) {
      if (this.isInitialized) return;

      this.isLoading = true;
      try {
        await this.fetchMilestones(installationId, owner, repo);
        this.isInitialized = true;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMilestones(installationId, owner, repo) {
      this.isFetching = true;
      this.error = null;
      const key = `${installationId}:${owner}:${repo}`;

      try {
        const octokit = await this.getOctokitInstance(installationId);
        const response = await octokit.rest.issues.listMilestonesForRepo({
          owner,
          repo,
          state: "open",
          sort: "due_on",
          direction: "asc",
          per_page: 100,
        });

        // Process milestones to add computed properties
        const processedMilestones = response.data.map(milestone => ({
          ...milestone,
          total_issues: milestone.open_issues + milestone.closed_issues,
          progress_percentage: milestone.open_issues + milestone.closed_issues === 0 ? 0 : Math.round((milestone.closed_issues / (milestone.open_issues + milestone.closed_issues)) * 100),
        }));

        // Update store with new milestones
        this.milestones[key] = processedMilestones;
        return processedMilestones;
      } catch (error) {
        this.error = error.message || "Failed to fetch milestones";
        console.error("Error fetching milestones:", error);
        throw error;
      } finally {
        this.isFetching = false;
      }
    },

    async createMilestone(installationId, owner, repo, milestoneData) {
      this.isLoading = true;
      this.error = null;

      try {
        const octokit = await this.getOctokitInstance(installationId);
        const response = await octokit.rest.issues.createMilestone({
          owner,
          repo,
          ...milestoneData,
        });

        if (response.status === 201) {
          // Refresh milestones after creation
          await this.fetchMilestones(installationId, owner, repo);
          return response.data;
        }
        return null;
      } catch (error) {
        this.error = error.message || "Failed to create milestone";
        console.error("Error creating milestone:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateMilestone(installationId, owner, repo, milestoneNumber, milestoneData) {
      this.isLoading = true;
      this.error = null;

      try {
        const octokit = await this.getOctokitInstance(installationId);
        const response = await octokit.rest.issues.updateMilestone({
          owner,
          repo,
          milestone_number: milestoneNumber,
          ...milestoneData,
        });

        if (response.status === 200) {
          // Refresh milestones after update
          await this.fetchMilestones(installationId, owner, repo);
          return response.data;
        }
        return null;
      } catch (error) {
        this.error = error.message || "Failed to update milestone";
        console.error("Error updating milestone:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteMilestone(installationId, owner, repo, milestoneNumber) {
      this.isLoading = true;
      this.error = null;

      try {
        const octokit = await this.getOctokitInstance(installationId);
        const response = await octokit.rest.issues.deleteMilestone({
          owner,
          repo,
          milestone_number: milestoneNumber,
        });

        if (response.status === 204) {
          // Remove from local state
          const key = `${installationId}:${owner}:${repo}`;
          if (this.milestones[key]) {
            this.milestones[key] = this.milestones[key].filter(m => m.number !== milestoneNumber);
          }
          return true;
        }
        return false;
      } catch (error) {
        this.error = error.message || "Failed to delete milestone";
        console.error("Error deleting milestone:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearMilestones(installationId, owner, repo) {
      const key = `${installationId}:${owner}:${repo}`;
      this.milestones[key] = [];
      this.error = null;
    },
  },

  getters: {
    isLoadingAny: state => state.isLoading || state.isFetching,

    getMilestones: state => (installationId, owner, repo) => {
      const key = `${installationId}:${owner}:${repo}`;
      return state.milestones[key] || [];
    },

    getMilestoneById: state => (installationId, owner, repo, milestoneId) => {
      const key = `${installationId}:${owner}:${repo}`;
      return state.milestones[key]?.find(m => m.id === milestoneId);
    },

    getMilestoneByNumber: state => (installationId, owner, repo, milestoneNumber) => {
      const key = `${installationId}:${owner}:${repo}`;
      return state.milestones[key]?.find(m => m.number === milestoneNumber);
    },

    hasMilestones: state => (installationId, owner, repo) => {
      const key = `${installationId}:${owner}:${repo}`;
      return (state.milestones[key]?.length || 0) > 0;
    },
  },
});
