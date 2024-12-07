import { defineStore } from "pinia";
import axios from "axios";

export const useProjectStore = defineStore("projectStore", {
  state: () => ({
    projects: {}, // { [projectId]: projectData }
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchProjects(userId) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.get(`/proj-members/users/${userId}`);

        if (response.data.success && response.data.data.length > 0) {
          // Clear existing projects before updating
          this.projects = {};

          // Get proj_member_infos from the first user's data
          const projMemberInfos = response.data.data[0].proj_member_infos;

          // Process each project
          projMemberInfos.forEach(proj => {
            const projId = proj.proj_id;
            this.projects[projId] = {
              ...proj,
              // Optional: Transform data if needed
              startTime: new Date(proj.start_time),
              endTime: new Date(proj.end_time),
              createdAt: new Date(proj.created_at),
              // Add any other transformations here
            };
          });
        } else {
          throw new Error("No project data available");
        }
      } catch (error) {
        this.error = error.message || "Failed to fetch projects";
        console.error("Error fetching projects:", error);
      } finally {
        this.isLoading = false;
      }
    },

    getProject(projectId) {
      return this.projects[projectId];
    },

    getBookmarkedProjects() {
      return Object.values(this.projects).filter(proj => proj.bookmark_status === "BOOKMARKED");
    },

    getProjectsByStatus(status) {
      return Object.values(this.projects).filter(proj => proj.progress_status === status);
    },

    // Optional: Add method to get projects sorted by date
    getProjectsSortedByDate() {
      return Object.values(this.projects).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
  },

  getters: {
    totalProjects: state => Object.keys(state.projects).length,

    averageProgress: state => {
      const projects = Object.values(state.projects);
      if (projects.length === 0) return 0;

      const totalProgress = projects.reduce((sum, proj) => sum + proj.progress_status, 0);
      return totalProgress / projects.length;
    },

    projectsInProgress: state => {
      return Object.values(state.projects).filter(proj => proj.progress_status > 0 && proj.progress_status < 100);
    },
  },
});
