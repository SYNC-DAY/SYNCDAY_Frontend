import { projectApi } from '@/api/proj/project';
import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
    state: () => ({
        projects: {},
        isLoading: true,
        error: null,
        activeProjectId: null,
        activeWorkspaceId: null
    }),

    getters: {
        hasProjects: (state) => Object.keys(state.projects).length > 0,
        hasProjects: (state) => Object.keys(state.projects).length > 0,

        getProjectById: (state) => (id) => state.projects[id] || null,

        activeProject: (state) => (state.activeProjectId ? state.projects[state.activeProjectId] : null),

        activeWorkspace: (state) => {
            if (!state.activeProjectId || !state.activeWorkspaceId) return null;

            const project = state.projects[state.activeProjectId];
            return project?.workspaces?.find((workspace) => workspace.workspace_id === state.activeWorkspaceId);
        }

        // Get projects as an array for v-for iteration
    },

    actions: {
        async initializeStore(userId) {
            this.isLoading = true;
            this.error = null;

            try {
                const projects = await projectApi.getUserProjects(userId);
                this.projects = projects.reduce((acc, project) => {
                    acc[project.proj_id] = project;
                    return acc;
                }, {});
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        }
    }
});
