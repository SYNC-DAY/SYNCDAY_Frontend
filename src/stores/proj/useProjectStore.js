import { defineStore } from "pinia";
import axios from "axios";

export const useProjectStore = defineStore("projectStore", {
  state: () => ({
    projects: {}, // { [projectId]: projectData }
    workspaces: {}, // { [projectId]: { [workspaceId]: workspaceData } }
    isLoading: false,
    isFetching: false,
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

          // Create new projects and workspaces objects while maintaining reactivity
          const newProjects = {};
          const newWorkspaces = {};

          projMemberInfos.forEach(proj => {
            // Handle project data
            newProjects[proj.proj_id] = {
              ...proj,
              startTime: proj.start_time ? new Date(proj.start_time) : null,
              endTime: proj.end_time ? new Date(proj.end_time) : null,
              createdAt: new Date(proj.created_at),
              bookmark_status: proj.bookmark_status || "NONE",
            };

            // Handle workspaces data
            if (proj.workspaces && proj.workspaces.length > 0) {
              newWorkspaces[proj.proj_id] = {};
              proj.workspaces.forEach(workspace => {
                newWorkspaces[proj.proj_id][workspace.workspace_id] = {
                  ...workspace,
                  createdAt: new Date(workspace.created_at),
                };
              });
            }
          });

          // Update the store
          this.projects = newProjects;
          this.workspaces = newWorkspaces;
        } else {
          this.projects = {};
          this.workspaces = {};
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

      // Initialize workspaces object for the new project
      if (project.workspaces && project.workspaces.length > 0) {
        this.workspaces[project.proj_id] = {};
        project.workspaces.forEach(workspace => {
          this.workspaces[project.proj_id][workspace.workspace_id] = {
            ...workspace,
            createdAt: new Date(workspace.created_at),
          };
        });
      }
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
        return false;
      }
    },

    async updateWorkspace(workspaceData) {
      try {
        const response = await axios.put("/proj-members/workspaces", workspaceData);

        if (response.data.success) {
          const resultData = response.data.data;
          const projId = workspaceData.proj_id;
          const workspaceId = workspaceData.workspace_id;

          // Ensure the project exists in workspaces
          if (!this.workspaces[projId]) {
            this.workspaces[projId] = {};
          }

          // Update the workspace
          console.log(resultData);
          this.workspaces[projId][workspaceId] = {
            ...resultData,
          };

          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating workspace:", error);
        return false;
      }
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

    // New getters for workspaces
    getProjectWorkspaces: state => projId => {
      return state.workspaces[projId] || {};
    },

    getWorkspace: state => (projId, workspaceId) => {
      return state.workspaces[projId]?.[workspaceId];
    },
  },
});
