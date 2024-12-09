import { defineStore } from "pinia";
import { workspaceApi } from "@/api/proj/workspace";
export const useWorkspaceStore = defineStore("workspace", {
	state: () => ({
		currentWorkspace: null,
		recentActivities: [],
		isLoading: false,
		error: null,
	}),

	getters: {
		completedTasks: state => {
			if (!state.currentWorkspace) return 0;
			return state.currentWorkspace.completed_tasks || 0;
		},
		totalTasks: state => {
			if (!state.currentWorkspace) return 0;
			return state.currentWorkspace.total_tasks || 0;
		},
	},

	actions: {
		async fetchWorkspace(workspaceId) {
			this.isLoading = true;
			try {
				this.currentWorkspace = await workspaceApi.getWorkspace(workspaceId);
				// await this.fetchRecentActivities(workspaceId);
			} catch (error) {
				this.error = error.message;
				throw error;
			} finally {
				this.isLoading = false;
			}
		},

		async updateWorkspace(workspaceId, data) {
			try {
				this.currentWorkspace = await workspaceApi.updateWorkspace(workspaceId, data);
			} catch (error) {
				this.error = error.message;
				throw error;
			}
		},

		async deleteWorkspace(workspaceId) {
			try {
				await workspaceApi.deleteWorkspace(workspaceId);
				this.currentWorkspace = null;
			} catch (error) {
				this.error = error.message;
				throw error;
			}
		},

		async refreshProgress(workspaceId) {
			try {
				const updatedWorkspace = await workspaceApi.refreshProgress(workspaceId);
				this.currentWorkspace = updatedWorkspace;
			} catch (error) {
				this.error = error.message;
				throw error;
			}
		},

		async linkRepository(workspaceId, repoData) {
			try {
				this.currentWorkspace = await workspaceApi.linkRepository(workspaceId, repoData);
			} catch (error) {
				this.error = error.message;
				throw error;
			}
		},

		async fetchRecentActivities(workspaceId) {
			try {
				this.recentActivities = await workspaceApi.getRecentActivities(workspaceId);
			} catch (error) {
				this.error = error.message;
				throw error;
			}
		},
	},
});
