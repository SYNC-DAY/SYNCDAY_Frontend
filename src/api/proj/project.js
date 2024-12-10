import axios from "axios";

export const projectApi = {
  // Get all projects for a user
  async getUserProjects(userId) {
    const response = await axios.get(`proj-members/users/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch projects");
    }
    return response.data.data;
  },

  // Create new project
  async createProject(projectData) {
    const response = await axios.post(BASE_URL, {
      user_id: projectData.userId,
      proj_name: projectData.name,
      start_time: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
      end_time: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create project");
    }
    return response.data.data;
  },

  // Update project
  async updateProject(projectId, updateData) {
    const response = await axios.put(`${BASE_URL}/${projectId}`, updateData);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update project");
    }
    return response.data.data;
  },

  // Delete project
  async deleteProject(projectId) {
    const response = await axios.delete(`${BASE_URL}/${projectId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete project");
    }
    return response.data.data;
  },

  // Toggle project bookmark
  async updateBookmarkStatus(projectId, status) {
    const response = await axios.put(`${BASE_URL}/${projectId}/bookmark`, {
      bookmark_status: status,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update bookmark status");
    }
    return response.data.data;
  },

  // Create workspace
  async createWorkspace(projectId, workspaceData) {
    const response = await axios.post(`${BASE_URL}/${projectId}/workspaces`, workspaceData);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create workspace");
    }
    return response.data.data;
  },

  // Update workspace
  async updateWorkspace(projectId, workspaceId, updateData) {
    const response = await axios.put(`${BASE_URL}/${projectId}/workspaces/${workspaceId}`, updateData);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update workspace");
    }
    return response.data.data;
  },

  // Delete workspace
  async deleteWorkspace(projectId, workspaceId) {
    const response = await axios.delete(`${BASE_URL}/${projectId}/workspaces/${workspaceId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete workspace");
    }
    return response.data.data;
  },
};
