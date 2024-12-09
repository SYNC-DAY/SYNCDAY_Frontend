import { defineStore } from "pinia";
import axios from "axios";
import { projectApi } from "@/api/proj/project";

export const useProjectStore = defineStore("project", {
  state: () => ({
    projects: {},
    isLoading: true,
    error: null,
    activeProjectId: null,
    activeWorkspaceId: null,
  }),

  getters: {
    hasProjects: state => Object.keys(state.projects).length > 0,
    hasProjects: state => Object.keys(state.projects).length > 0,

    getProjectById: state => id => state.projects[id] || null,

    activeProject: state => (state.activeProjectId ? state.projects[state.activeProjectId] : null),

    activeWorkspace: state => {
      if (!state.activeProjectId || !state.activeWorkspaceId) return null;

      const project = state.projects[state.activeProjectId];
      return project?.workspaces?.find(workspace => workspace.workspace_id === state.activeWorkspaceId);
    },

    // Get projects as an array for v-for iteration
    projectsArray: state =>
      Object.values(state.projects).sort((a, b) => {
        // Sort by bookmark status (bookmarked first) then by created date
        if (a.bookmark_status === b.bookmark_status) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return a.bookmark_status === "BOOKMARKED" ? -1 : 1;
      }),

    // Get bookmarked projects
    bookmarkedProjects: state => Object.values(state.projects).filter(project => project.bookmark_status === "BOOKMARKED"),
  },

  actions: {
    async initializeStore(userId) {
      this.isLoading = true;
      this.error = null;

      try {
        const data = await projectApi.getUserProjects(userId);
        const userProjects = data[0]?.proj_member_infos || [];

        this.projects = userProjects.reduce((acc, projectInfo) => {
          const validWorkspaces = projectInfo.workspaces.filter(workspace => workspace.workspace_id !== null);

          acc[projectInfo.proj_id] = {
            proj_id: projectInfo.proj_id,
            proj_name: projectInfo.proj_name,
            start_time: projectInfo.start_time,
            end_time: projectInfo.end_time,
            created_at: projectInfo.created_at,
            progress_status: projectInfo.progress_status,
            bookmark_status: projectInfo.bookmark_status,
            participation_status: projectInfo.participation_status,
            vcs_type: projectInfo.vcs_type,
            vcs_proj_url: projectInfo.vcs_proj_url,
            vcs_installation_id: projectInfo.vcs_installation_id,
            workspaces: validWorkspaces,
          };
          return acc;
        }, {});
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createProject(projectData) {
      try {
        const newProject = await projectApi.createProject(projectData);
        this.projects[newProject.proj_id] = {
          ...newProject,
          workspaces: [],
        };
        return newProject;
      } catch (error) {
        throw error;
      }
    },

    async updateProject(projectId, updateData) {
      try {
        const updatedProject = await projectApi.updateProject(projectId, updateData);
        this.projects[projectId] = {
          ...this.projects[projectId],
          ...updatedProject,
        };
        return updatedProject;
      } catch (error) {
        throw error;
      }
    },

    async deleteProject(projectId) {
      try {
        await projectApi.deleteProject(projectId);
        delete this.projects[projectId];
        if (this.activeProjectId === projectId) {
          this.clearActiveStates();
        }
      } catch (error) {
        throw error;
      }
    },

    async toggleBookmark(projectId) {
      try {
        const newStatus = this.projects[projectId].bookmark_status === "BOOKMARKED" ? "NONE" : "BOOKMARKED";

        await projectApi.updateBookmarkStatus(projectId, newStatus);
        this.projects[projectId].bookmark_status = newStatus;
        return newStatus;
      } catch (error) {
        throw error;
      }
    },

    async createWorkspace(projectId, workspaceData) {
      try {
        const newWorkspace = await projectApi.createWorkspace(projectId, workspaceData);
        this.projects[projectId].workspaces.push(newWorkspace);
        return newWorkspace;
      } catch (error) {
        throw error;
      }
    },

    async createProject({ userId, projectData }) {
      try {
        const response = await axios.post("/proj-members/projs", {
          user_id: userId,
          proj_name: projectData.name,
          start_time: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
          end_time: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
        });

        if (response.data.success) {
          const newProject = {
            proj_id: response.data.data.proj_id,
            proj_name: projectData.name,
            start_time: projectData.startDate,
            end_time: projectData.endDate,
            progress_status: 0,
            bookmark_status: "NONE",
            participation_status: "OWNER",
            created_at: new Date().toISOString(),
            workspaces: [],
          };

          // Add new project to state
          this.projects[newProject.proj_id] = newProject;

          // Set as active project
          this.setActiveProject(newProject.proj_id);

          return newProject;
        } else {
          throw new Error(response.data.message || "Failed to create project");
        }
      } catch (error) {
        throw error;
      }
    },

    async updateProject(projectId, updateData) {
      try {
        const response = await axios.put(`/proj-members/projs/${projectId}`, updateData);

        if (response.data.success) {
          // Update project in state
          this.projects[projectId] = {
            ...this.projects[projectId],
            ...updateData,
          };

          return this.projects[projectId];
        } else {
          throw new Error(response.data.message || "Failed to update project");
        }
      } catch (error) {
        throw error;
      }
    },

    setActiveProject(projectId) {
      this.activeProjectId = projectId;
      this.activeWorkspaceId = null; // Clear active workspace when changing projects
    },

    setActiveWorkspace(projectId, workspaceId) {
      this.activeProjectId = projectId;
      this.activeWorkspaceId = workspaceId;
    },

    clearActiveStates() {
      this.activeProjectId = null;
      this.activeWorkspaceId = null;
    },

    // Workspace related actions
  },
});
