import axios from "axios";

const BASE_URL = "/workspaces/";

const transformWorkspaceData = workspace => ({
  workspace_id: workspace.workspace_id,
  workspace_name: workspace.workspace_name,
  vcs_repo_url: workspace.vcs_repo_url,
  vcs_type: workspace.vcs_type,
  progress_status: workspace.progress_status,
  proj_id: workspace.proj_id,
});

export const workspaceApi = {
  async createWorkspace(projectId, workspaceData) {
    const response = await axios.post(`${BASE_URL}`, workspaceData);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create workspace");
    }
    return transformWorkspaceData(response.data.data);
  },

  async updateWorkspace(projectId, workspaceId, updateData) {
    const response = await axios.put(`${BASE_URL}/${projectId}/workspaces/${workspaceId}`, updateData);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update workspace");
    }
    return transformWorkspaceData(response.data.data);
  },

  async deleteWorkspace(projectId, workspaceId) {
    const response = await axios.delete(`${BASE_URL}/${projectId}/workspaces/${workspaceId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete workspace");
    }
  },

  async linkRepository(projectId, workspaceId, repoData) {
    const response = await axios.put(`${BASE_URL}/${projectId}/workspaces/${workspaceId}/repository`, repoData);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to link repository");
    }
    return transformWorkspaceData(response.data.data);
  },

  async refreshProgress(projectId, workspaceId) {
    const response = await axios.get(`${BASE_URL}/${projectId}/workspaces/${workspaceId}/progress`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to refresh progress");
    }
    return response.data.data.progress_status;
  },
};
