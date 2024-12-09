import axios from "axios";

const BASE_URL = "/proj-members";

const transformProjectData = projectInfo => ({
  proj_id: projectInfo.proj_id,
  proj_name: projectInfo.proj_name,
  start_time: projectInfo.start_time,
  end_time: projectInfo.end_time,
  created_at: projectInfo.created_at,
  progress_status: projectInfo.progress_status,
  bookmark_status: projectInfo.bookmark_status,
  participation_status: projectInfo.participation_status,
  vcs_type: projectInfo.vcs_type,
  vcs_proj_url: projectInfo.vcs_proj_url,
  vcs_installation_id: projectInfo.vcs_installation_id,
  workspaces: projectInfo.workspaces.filter(w => w.workspace_id !== null),
});

export const projectApi = {
  async getUserProjects(userId) {
    const response = await axios.get(`${BASE_URL}/users/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch projects");
    }

    const userProjects = response.data.data[0]?.proj_member_infos || [];

    // Transform into a map of projects
    return userProjects.reduce((acc, projectInfo) => {
      acc[projectInfo.proj_id] = transformProjectData(projectInfo);
      return acc;
    }, {});
  },

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

    // Transform and return the new project data
    return {
      proj_id: response.data.data.proj_id,
      proj_name: projectData.name,
      start_time: projectData.startDate,
      end_time: projectData.endDate,
      progress_status: 0,
      bookmark_status: "NONE",
      participation_status: "OWNER",
      created_at: new Date().toISOString(),
      workspaces: [],
    };
  },

  async updateProject(projectId, updateData) {
    const response = await axios.put(`${BASE_URL}/${projectId}`, updateData);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update project");
    }
    return transformProjectData(response.data.data);
  },

  async deleteProject(projectId) {
    const response = await axios.delete(`${BASE_URL}/${projectId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete project");
    }
  },

  async updateBookmarkStatus(projectId, status) {
    const response = await axios.put(`${BASE_URL}/${projectId}/bookmark`, {
      bookmark_status: status,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update bookmark status");
    }
    return response.data.data.bookmark_status;
  },
};
