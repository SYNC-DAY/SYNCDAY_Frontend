import axios from 'axios';
const parseProjectData = (projectInfo) => ({
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
    workspaces: projectInfo.workspaces?.filter((workspace) => workspace.workspace_id !== null) || []
});

export const projectApi = {
    // Get all projects for a user
    async getUserProjects(userId) {
        const response = await axios.get(`proj-members/users/${userId}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch projects');
        }

        const userProjects = response.data.data[0]?.proj_member_infos || [];
        return userProjects.map(parseProjectData);
    }

    // Create new project
};
