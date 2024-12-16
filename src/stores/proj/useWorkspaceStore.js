import { defineStore } from 'pinia';

export const useWorkspaceStore = defineStore('workspace', {
    state: () => ({
        workspaces: {},
        activeWorkspaceId: null,
        isLoading: false,
        error: null,
        lastFetchTime: null
    }),

    getters: {
        activeWorkspace: (state) => state.workspaces[state.activeWorkspaceId] || null,

        projectWorkspaces: (state) => (projectId) => Object.values(state.workspaces).filter((workspace) => workspace.projectId === projectId),

        shouldRefetch: (state) => {
            if (!state.lastFetchTime) return true;
            const FIVE_MINUTES = 5 * 60 * 1000;
            return Date.now() - state.lastFetchTime > FIVE_MINUTES;
        }
    },

    actions: {
        async getWorkspaces(projectId) {
            if (this.lastFetchTime && !this.shouldRefetch) {
                return this.projectWorkspaces(projectId);
            }
            return this.fetchWorkspaces(projectId);
        },

        setActiveWorkspace(workspaceId) {
            this.activeWorkspaceId = workspaceId;
        },

        clearStore() {
            this.workspaces = {};
            this.activeWorkspaceId = null;
            this.lastFetchTime = null;
            this.error = null;
        }
    }
});
