// githubRepositories API
import axios from "axios";
const RepositoriesAPI = {
  getRepositories: async installationId => {
    try {
      const response = await axios.get(`/github/repositories/installations/${installationId}`);
      if (response.data.success) {
        return new response.data.data();
      }
      throw new Error("Failed to fetch repositories");
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
