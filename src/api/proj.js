import axios from "axios";

// Project APIs
export const projAPI = {
  // Get all projects for the authenticated user
  async updateProjVCS(userId, projId, vcsType, vcsUrl) {
    try {
      const response = await axios.put(`/projs/vcs`, {
        user_id: userId,
        proj_id: projId,
        vcs_type: "GITHUB",
        vcs_proj_url: vcsUrl,
      });
      if (response.data.success) {
        const updatedProjVcsInfo = response.data.data;
        console.log(updatedProjVcsInfo);
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};

export default projAPI;
