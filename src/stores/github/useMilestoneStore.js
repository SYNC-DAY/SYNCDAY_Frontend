import { defineStore } from "pinia";
import axios from "axios";

export const useMilestoneStore = defineStore("milestone", {
  state: () => ({
    milestones: [],
    selectedMilestone: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchMilestones(repoId) {
      this.loading = true;
      try {
        const response = await axios.get(`/github/milestones/${repoId}`);
        if (response.data.success) {
          this.milestones = response.data.data;
        } else {
          throw new Error(response.data.error || "Failed to fetch milestones");
        }
      } catch (err) {
        this.error = err.message || "Failed to fetch milestones";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async saveMilestone(milestoneId) {
      this.loading = true;
      try {
        await axios.post("/api/cardboard/milestone", { milestoneId });
        this.selectedMilestone = this.milestones.find(m => m.id === milestoneId) || null;
      } catch (err) {
        this.error = err.message || "Failed to save milestone";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    // Helper methods
    clearError() {
      this.error = null;
    },

    clearSelectedMilestone() {
      this.selectedMilestone = null;
    },
  },

  getters: {
    // Get open milestones
    openMilestones: state => {
      return state.milestones.filter(m => m.state === "open");
    },

    // Get closed milestones
    closedMilestones: state => {
      return state.milestones.filter(m => m.state === "closed");
    },

    // Get milestone by ID
    getMilestoneById: state => id => {
      return state.milestones.find(m => m.id === id);
    },

    // Get total issue count for a milestone
    getTotalIssues: state => id => {
      const milestone = state.milestones.find(m => m.id === id);
      return milestone ? milestone.openIssues + milestone.closedIssues : 0;
    },
  },
});
