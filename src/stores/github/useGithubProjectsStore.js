import { defineStore } from "pinia";
import { useGithubAuthStore } from "./useGithubAuthStore";
import { Octokit } from "@octokit/rest";
import { ref, computed } from "vue";

export const useGithubProjectsStore = defineStore("githubProjects", () => {
  const userProjects = ref([]);
  const orgProjects = ref({});
  const selectedProject = ref(null);
  const octokit = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const getOrgProjects = computed(() => {
    return orgName => orgProjects.value[orgName] || [];
  });

  function initializeOctokit() {
    if (!octokit.value) {
      const authStore = useGithubAuthStore();
      const token = authStore.accessToken;

      if (!token) {
        throw new Error("No access token available");
      }

      octokit.value = new Octokit({
        auth: token,
      });
    }

    return octokit.value;
  }

  async function fetchOrgProjects(orgName) {
    if (!orgName) {
      throw new Error("Organization name is required");
    }

    try {
      isLoading.value = true;
      const octokitInstance = initializeOctokit();

      const query = `
        query($orgName: String!) {
          organization(login: $orgName) {
            projectsV2(first: 100) {
              nodes {
                id
                title
                shortDescription
                url
                closed
                updatedAt
                number
                items {
                  nodes {
                    id
                  }
                }
              }
            }
          }
        }
      `;

      const response = await octokitInstance.graphql(query, {
        orgName,
      });

      console.log(`Response for ${orgName}:`, response);
      const projects = response?.data?.organization?.projectsV2?.nodes;
      if (projects) {
        orgProjects.value[orgName] = projects;
        return projects;
      }

      orgProjects.value[orgName] = [];
      return [];
    } catch (err) {
      console.error(`Error fetching projects for org ${orgName}:`, err);
      error.value = err.message;
      orgProjects.value[orgName] = [];
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAllOrgProjects(orgNames) {
    try {
      isLoading.value = true;
      const promises = orgNames.map(orgName => fetchOrgProjects(orgName));
      await Promise.all(promises);
    } catch (err) {
      console.error("Error fetching all org projects:", err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  function clearState() {
    userProjects.value = [];
    orgProjects.value = {};
    selectedProject.value = null;
    error.value = null;
    octokit.value = null;
  }

  function clearOrgProjects(orgName) {
    if (orgName) {
      delete orgProjects.value[orgName];
    } else {
      orgProjects.value = {};
    }
  }

  return {
    userProjects,
    orgProjects,
    selectedProject,
    isLoading,
    error,
    getOrgProjects,
    initializeOctokit,
    fetchOrgProjects,
    fetchAllOrgProjects,
    clearState,
    clearOrgProjects,
  };
});
