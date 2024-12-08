export const useMilestoneStore = defineStore("milestone", {
  state: () => ({
    milestones: [],
    selectedMilestone: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchMilestones() {
      this.loading = true;
      try {
        const response = await axios.get("/api/milestones");
        this.milestones = response.data;
      } catch (err) {
        this.error = "Failed to fetch milestones";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async saveMilestone(milestoneId) {
      this.loading = true;
      try {
        await axios.post("/api/cardboard/milestone", { milestoneId });
        this.selectedMilestone = this.milestones.find(m => m.id === milestoneId);
      } catch (err) {
        this.error = "Failed to save milestone";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
