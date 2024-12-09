// api/proj/workspace.js
import axios from "axios";

/**
 * Workspace API module for handling all workspace-related API calls
 */
const WorkspaceAPI = {
  /**
   * Fetch workspace details by ID
   * @param {string|number} workspaceId - The ID of the workspace to fetch
   * @returns {Promise<Object>} The workspace data
   * @throws {Error} If the request fails
   */
  getWorkspaceById: async workspaceId => {
    try {
      const response = await axios.get(`/workspaces/${workspaceId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error("Failed to fetch workspace data");
    } catch (error) {
      console.error("Error fetching workspace:", error);
      throw error;
    }
  },

  /**
   * Update workspace details
   * @param {string|number} workspaceId - The ID of the workspace to update
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated workspace data
   */
  updateWorkspace: async (workspaceId, updateData) => {
    try {
      const response = await axios.put(`/workspaces/${workspaceId}`, updateData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error("Failed to update workspace");
    } catch (error) {
      console.error("Error updating workspace:", error);
      throw error;
    }
  },

  /**
   * Update workspace tags
   * @param {string|number} workspaceId - The ID of the workspace
   * @param {Array} tags - Array of tag IDs to assign
   * @returns {Promise<Object>} The updated workspace tags
   */
  updateWorkspaceTags: async (workspaceId, tags) => {
    try {
      const response = await axios.put(`/workspaces/${workspaceId}/tags`, { tags });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error("Failed to update workspace tags");
    } catch (error) {
      console.error("Error updating workspace tags:", error);
      throw error;
    }
  },

  /**
   * Delete a workspace
   * @param {string|number} workspaceId - The ID of the workspace to delete
   * @returns {Promise<void>}
   */
  deleteWorkspace: async workspaceId => {
    try {
      const response = await axios.delete(`/workspaces/${workspaceId}`);
      if (!response.data.success) {
        throw new Error("Failed to delete workspace");
      }
    } catch (error) {
      console.error("Error deleting workspace:", error);
      throw error;
    }
  },
};

export default WorkspaceAPI;
