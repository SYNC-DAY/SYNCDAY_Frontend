import axios from 'axios';

// Transform individual project data from response
const parseProjectData = (projectMember) => ({
    proj_member_id: projectMember.proj_member_id,
    proj_id: projectMember.proj.proj_id,
    proj_name: projectMember.proj.proj_name,
    start_time: new Date(projectMember.proj.start_time),
    end_time: new Date(projectMember.proj.end_time),
    created_at: new Date(projectMember.proj.created_at),
    updated_at: new Date(projectMember.proj.updated_at),
    bookmark_status: projectMember.bookmark_status,
    participation_status: projectMember.participation_status,
    vcs_installation_index: projectMember.proj.vcs_installation_index
});

export const projectApi = {
    /**
     * Get all projects for a user
     * @param {number} userId - The ID of the user
     * @returns {Promise<Array>} Array of parsed project data
     */
    async getUserProjects(userId) {
        try {
            const response = await axios.get(`proj-members/users/${userId}`);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch projects');
            }

            return response.data.data.map(parseProjectData);
        } catch (error) {
            console.error('Error fetching user projects:', error);
            throw error;
        }
    },

    /**
     * Create a new project
     * @param {Object} projectData - The project data to create
     * @returns {Promise<Object>} Created project data
     */
    async createProject(projectData) {
        try {
            const response = await axios.post('projects', projectData);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to create project');
            }

            return parseProjectData(response.data.data);
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    },

    /**
     * Update an existing project
     * @param {number} projectId - The ID of the project to update
     * @param {Object} projectData - The project data to update
     * @returns {Promise<Object>} Updated project data
     */
    async updateProject(projectId, projectData) {
        try {
            const response = await axios.put(`projects/${projectId}`, projectData);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to update project');
            }

            return parseProjectData(response.data.data);
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    /**
     * Delete a project
     * @param {number} projectId - The ID of the project to delete
     * @returns {Promise<void>}
     */
    async deleteProject(projectId) {
        try {
            const response = await axios.delete(`projects/${projectId}`);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    },

    /**
     * Update project member status
     * @param {number} projMemberId - The ID of the project member
     * @param {Object} statusData - The status data to update
     * @returns {Promise<Object>} Updated project member data
     */
    async updateProjectMemberStatus(projMemberId, statusData) {
        try {
            const response = await axios.put(`proj-members/${projMemberId}/status`, statusData);

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to update project member status');
            }

            return parseProjectData(response.data.data);
        } catch (error) {
            console.error('Error updating project member status:', error);
            throw error;
        }
    }
};
