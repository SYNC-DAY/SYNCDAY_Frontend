// useProjectStore.js
import { defineStore } from "pinia";
import axios from "axios";

export const useProjectStore = defineStore("projectStore", {
  state: () => ({
    projects: {}, // { [projectId]: projectData }

    isLoading: false,
  }),

  actions: {
    async fetchProjects(userId) {
      this.isLoading = true;
      try {
        const response = await axios.get(`/proj-members/users/${userId}`);
        if (response.data.success) {
          response.data.data[0].proj_member_infos.forEach(proj => {
            console.log(proj);
            const projId = proj.proj_id;
            this.projects[projId] = proj;
          });
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    addProject(project) {
      this.project.projects[project.proj_id] = project;
    },

    updateProject(projectId, updates) {
      if (this.project.projects[projectId]) {
        this.project.projects[projectId] = {
          ...this.project.projects[projectId],
          ...updates,
        };
      }
    },

    removeProject(projectId) {
      delete this.project.projects[projectId];
    },
  },
});
