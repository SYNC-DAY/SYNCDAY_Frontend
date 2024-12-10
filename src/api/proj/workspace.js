import axios from "axios";

const BASE_URL = "/workspaces";

export const workspaceApi = {
	getWorkspace: async workspaceId => {
		const response = await axios.get(`${BASE_URL}/${workspaceId}`);
		return response.data;
	},

	updateWorkspace: async (workspaceId, data) => {
		const response = await axios.put(`${BASE_URL}/${workspaceId}`, data);
		return response.data;
	},

	deleteWorkspace: async workspaceId => {
		await axios.delete(`${BASE_URL}/${workspaceId}`);
	},

	refreshProgress: async workspaceId => {
		const response = await axios.post(`${BASE_URL}/${workspaceId}/refresh-progress`);
		return response.data;
	},

	linkRepository: async (workspaceId, repoData) => {
		const response = await axios.post(`${BASE_URL}/${workspaceId}/link-repository`, repoData);
		return response.data;
	},

	getRecentActivities: async workspaceId => {
		const response = await axios.get(`${BASE_URL}/${workspaceId}/activities`);
		return response.data;
	},
};
export default workspaceApi;
