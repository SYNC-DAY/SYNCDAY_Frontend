import { defineStore } from "pinia";
import axios from "axios";

export const useProjectStore = defineStore("projectStore", {
  state: () => ({
    projects: {}, // { [projectId]: projectData }
    isLoading: false,
    isFetching: false, // New state for fetch operations
    error: null,
    isInitialized: false,
  }),

  actions: {
    async initializeStore(userId) {
      if (this.isInitialized) return;

      this.isLoading = true;
      try {
        await this.fetchProjects(userId);
        this.isInitialized = true;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProjects(userId) {
      this.isFetching = true;
      this.error = null;

      try {
        const response = await axios.get(`/proj-members/users/${userId}`);

        if (response.data.success && response.data.data.length > 0) {
          const projMemberInfos = response.data.data[0].proj_member_infos;

          // Create a new projects object while maintaining reactivity
          const newProjects = {};
          projMemberInfos.forEach(proj => {
            newProjects[proj.proj_id] = {
              ...proj,
              startTime: proj.start_time ? new Date(proj.start_time) : null,
              endTime: proj.end_time ? new Date(proj.end_time) : null,
              createdAt: new Date(proj.created_at),
              bookmark_status: proj.bookmark_status || "NONE",
            };
          });

          // Update the projects object
          this.projects = newProjects;
        } else {
          this.projects = {};
        }
      } catch (error) {
        this.error = error.message || "Failed to fetch projects";
        console.error("Error fetching projects:", error);
        throw error;
      } finally {
        this.isFetching = false;
      }
    },

    addProject(project) {
      this.projects[project.proj_id] = {
        ...project,
        startTime: project.start_time ? new Date(project.start_time) : null,
        endTime: project.end_time ? new Date(project.end_time) : null,
        createdAt: new Date(project.created_at),
        bookmark_status: project.bookmark_status || "NONE",
      };
    },

    async handleBookmark(projMemberId, projId) {
      if (!projId || !projMemberId) {
        console.error("Missing projId or projMemberId");
        return;
      }

      try {
        const response = await axios({
          method: "PUT",
          url: "/proj-members/bookmark",
          params: {
            projMemberId: projMemberId,
          },
        });

        if (response.data.success) {
          const newStatus = response.data.data;

          // Update the project's bookmark status using Vue's reactivity
          if (this.projects[projId]) {
            this.projects[projId] = {
              ...this.projects[projId],
              bookmark_status: newStatus,
            };
          }

          return newStatus;
        }
      } catch (error) {
        console.error("Bookmark update failed:", error);
        throw error;
      }
    },
    async updateProject(projData) {
      try {
        const response = await axios.put("/proj-members/", projData);

        if (response.data.success) {
          const resultData = response.data.data;
          const projId = projData.proj_id;
          this.projects[projId] = { ...this.projects[projId], ...resultData };
          return true;
        }
        return false;
      } catch (error) {
        console.error(error);
      }
    },
    async updateWorkspace(workspaceData) {
      try {
        const response = await axios.put("/proj-members/workspaces", workspaceData);
        if (response.data.success) {
          const resultData = response.data.data;
          console.log(resultData);
        }
      } catch (error) {}
    },
  },

  getters: {
    isLoadingAny: state => state.isLoading || state.isFetching,

    hasProjects: state => Object.keys(state.projects).length > 0,

    getBookmarkedProjects: state => {
      return Object.values(state.projects).filter(proj => proj.bookmark_status === "BOOKMARKED");
    },

    isProjectBookmarked: state => projId => {
      return state.projects[projId]?.bookmark_status === "BOOKMARKED";
    },
    getInstallationId: state => projId => {
      return state.projects[projId]?.github_installation_id;
    },
    getProjMemberId: state => projId => {
      return state.projects[projId]?.proj_member_id;
    },
  },
});
