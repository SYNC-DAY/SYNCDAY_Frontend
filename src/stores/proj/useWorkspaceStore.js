import { workspaceApi } from '@/api/proj/workspace';
import { useProjectStore } from '@/stores/proj/useProjectStore';
import { defineStore } from 'pinia';

export const useWorkspaceStore = defineStore('workspace', {
    state: () => ({
        workspaces: {},
        isLoading: false,
        error: null,
        lastFetchTime: null,
        activeId: null
    }),

    getters: {
        getWorkspacesByProjectId: (state) => (projId) => {
            return Object.values(state.workspaces).filter((workspace) => workspace.proj_id === projId);
        },

        allWorkspaces: (state) => Object.values(state.workspaces),

        shouldRefetch: (state) => {
            if (!state.lastFetchTime) return true;
            const FIVE_MINUTES = 5 * 60 * 1000;
            return Date.now() - state.lastFetchTime > FIVE_MINUTES;
        },
        active: (state) => state.workspaces[state.activeId] || null
    },

    actions: {
        async loadWorkspacesForProjects() {
            const projectStore = useProjectStore();
            if (!projectStore.hasProjects) {
                return;
            }

            this.isLoading = true;
            try {
                const projIds = projectStore.projectsArray.map((proj) => proj.proj_id);
                const workspaces = await workspaceApi.getWorkspacesByProjectIds(projIds);
                this.processWorkspaces(workspaces);
                this.lastFetchTime = Date.now();
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        processWorkspaces(workspaces) {
            this.workspaces = workspaces.reduce((acc, workspace) => {
                acc[workspace.workspace_id] = workspace;
                return acc;
            }, {});
        },
        setActive(id) {
            this.activeId = id;
        }
    }
});
