import { projectApi } from '@/api/proj/project';
import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
    state: () => ({
        projects: {},
        isLoading: false,
        error: null,
        activeId: null,
        isInitialized: false,
        lastFetchTime: null
    }),

    getters: {
        hasProjects: (state) => Object.keys(state.projects).length > 0,

        getProjectById: (state) => (id) => state.projects[id] || null,

        activeProject: (state) => (state.activeId ? state.projects[state.activeId] : null),

        projectsArray: (state) => Object.values(state.projects),

        bookmarkedProjects: (state) => {
            return Object.values(state.projects).filter((project) => project.bookmark_status === 'BOOKMARKED');
        },

        ownedProjects: (state) => {
            return Object.values(state.projects).filter((project) => project.participation_status === 'OWNER');
        },

        memberProjects: (state) => {
            return Object.values(state.projects).filter((project) => project.participation_status === 'MEMBER');
        },

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
                const projectMembers = await projectApi.getUserProjects(userId);
                this.processProjectMembers(projectMembers);
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

        processProjectMembers(projectMembers) {
            if (!Array.isArray(projectMembers)) {
                console.error('Expected projectMembers to be an array:', projectMembers);
                return;
            }

            this.projects = projectMembers.reduce((acc, project) => {
                acc[project.proj_id] = {
                    proj_member_id: project.proj_member_id,
                    proj_id: project.proj_id,
                    proj_name: project.proj_name,
                    start_time: new Date(project.start_time),
                    end_time: new Date(project.end_time),
                    created_at: new Date(project.created_at),
                    updated_at: new Date(project.updated_at),
                    vcs_installation_index: project.vcs_installation_index,
                    bookmark_status: project.bookmark_status,
                    participation_status: project.participation_status
                };
                return acc;
            }, {});
        },

        async updateProjectMemberStatus(projMemberId, statusData) {
            try {
                const updatedProject = await projectApi.updateProjectMemberStatus(projMemberId, statusData);
                if (updatedProject && updatedProject.proj_id) {
                    this.projects[updatedProject.proj_id] = {
                        ...this.projects[updatedProject.proj_id],
                        bookmark_status: updatedProject.bookmark_status,
                        participation_status: updatedProject.participation_status
                    };
                }
                return updatedProject;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        setActive(projectId) {
            this.activeId = projectId;
        },

        clearStore() {
            this.projects = {};
            this.activeId = null;
            this.isInitialized = false;
            this.lastFetchTime = null;
            this.error = null;
        }
    }
});
