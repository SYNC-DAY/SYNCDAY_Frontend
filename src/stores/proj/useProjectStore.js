import { projectApi } from '@/api/proj/project';
import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
    state: () => ({
        projects: {},
        isLoading: false,
        error: null,
        activeProjectId: null,
        isInitialized: false,
        lastFetchTime: null
    }),

    getters: {
        hasProjects: (state) => Object.keys(state.projects).length > 0,
        getProjectById: (state) => (id) => state.projects[id] || null,
        activeProject: (state) => (state.activeProjectId ? state.projects[state.activeProjectId] : null),
        projectsArray: (state) => Object.values(state.projects),
        shouldRefetch: (state) => {
            if (!state.lastFetchTime) return true;
            const FIVE_MINUTES = 5 * 60 * 1000;
            return Date.now() - state.lastFetchTime > FIVE_MINUTES;
        }
    },

    actions: {
        async getProjects(userId) {
            if (this.isInitialized && !this.shouldRefetch) {
                return this.projects;
            }
            return this.fetchProjects(userId);
        },

        async fetchProjects(userId) {
            this.isLoading = true;
            this.error = null;
            try {
                const projects = await projectApi.getUserProjects(userId);
                this.setProjects(projects);
                this.lastFetchTime = Date.now();
                this.isInitialized = true;
                return this.projects;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        setProjects(projects) {
            this.projects = projects.reduce((acc, project) => {
                acc[project.proj_id] = project;
                return acc;
            }, {});
        },

        setActiveProject(projectId) {
            this.activeProjectId = projectId;
        },

        clearStore() {
            this.projects = {};
            this.activeProjectId = null;
            this.isInitialized = false;
            this.lastFetchTime = null;
            this.error = null;
        }
    }
});
