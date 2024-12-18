import axios from 'axios';

export const workspaceApi = {
    async getWorkspacesByProjectIds(projIds) {
        const response = await axios.get('workspaces/projs', {
            params: { projIds: projIds.join(',') }
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch workspaces');
        }

        return response.data.data;
    }
};
