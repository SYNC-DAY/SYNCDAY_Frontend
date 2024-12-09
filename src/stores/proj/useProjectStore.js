// stores/proj/useProjectStore.js
import { defineStore } from "pinia";
import { projectApi } from "@/api/proj/project";
export const useProjectStore = defineStore("project", {
  state: () => ({
    projects: {},
    isLoading: false,
    error: null,
    activeProjectId: null,
    activeWorkspaceId: null,
  }),

  getters: {
    hasProjects: state => Object.keys(state.projects).length > 0,

    getProjectById: state => id => state.projects[id] || null,

    activeProject: state => (state.activeProjectId ? state.projects[state.activeProjectId] : null),

    activeWorkspace: state => {
      if (!state.activeProjectId || !state.activeWorkspaceId) return null;

      const project = state.projects[state.activeProjectId];
      return project?.workspaces?.find(workspace => workspace.workspace_id === state.activeWorkspaceId);
    },

    projectsArray: state =>
      Object.values(state.projects).sort((a, b) => {
        if (a.bookmark_status === b.bookmark_status) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return a.bookmark_status === "BOOKMARKED" ? -1 : 1;
      }),

    bookmarkedProjects: state => Object.values(state.projects).filter(project => project.bookmark_status === "BOOKMARKED"),
  },
  actions: {
    async initializeStore(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await projectApi.getUserProjects(userId);
        this.setProjects(data);
      } catch (err) {
        console.error(err);
      }
    },
    setProjects(projectsData) {
      this.projects = projectsData;
    },

    addProject(project) {
      this.projects[project.proj_id] = {
        ...project,
        workspaces: project.workspaces || [],
      };
    },

    updateProject(projectId, updates) {
      this.projects[projectId] = {
        ...this.projects[projectId],
        ...updates,
      };
    },

    removeProject(projectId) {
      delete this.projects[projectId];
      if (this.activeProjectId === projectId) {
        this.clearActiveStates();
      }
    },

    // Workspace state updates
    addWorkspace(projectId, workspace) {
      if (!this.projects[projectId].workspaces) {
        this.projects[projectId].workspaces = [];
      }
      this.projects[projectId].workspaces.push(workspace);
    },

    updateWorkspace(projectId, workspaceId, updates) {
      const workspace = this.projects[projectId].workspaces.find(w => w.workspace_id === workspaceId);
      if (workspace) {
        Object.assign(workspace, updates);
      }
    },

    removeWorkspace(projectId, workspaceId) {
      const project = this.projects[projectId];
      if (project?.workspaces) {
        project.workspaces = project.workspaces.filter(w => w.workspace_id !== workspaceId);
      }
      if (this.activeWorkspaceId === workspaceId) {
        this.activeWorkspaceId = null;
      }
    },

    // Loading state
    setLoading(status) {
      this.isLoading = status;
    },

    setError(error) {
      this.error = error;
    },

    // Active states
    setActiveProject(projectId) {
      this.activeProjectId = projectId;
      this.activeWorkspaceId = null;
    },

    setActiveWorkspace(projectId, workspaceId) {
      this.activeProjectId = projectId;
      this.activeWorkspaceId = workspaceId;
    },

    clearActiveStates() {
      this.activeProjectId = null;
      this.activeWorkspaceId = null;
    },
  },
});
