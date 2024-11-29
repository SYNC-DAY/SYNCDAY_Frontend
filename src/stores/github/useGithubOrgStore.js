import { defineStore } from "pinia";
import { useGithubAuthStore } from "./useGithubAuthStore";
import { Octokit } from "@octokit/rest";
import { ref, computed } from "vue";

export const useGithubOrgStore = defineStore("githubOrg", () => {
  const organizations = ref({});
  const selectedOrg = ref(null);
  const selectedProject = ref(null);
  const octokit = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

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

  async function fetchOrganizations(forceRefresh = false) {
    try {
      if (!octokit.value) {
        initializeOctokit();
      }

      isLoading.value = true;
      const { data: orgs } = await octokit.value.rest.orgs.listForAuthenticatedUser();

      // Transform organizations data structure
      const orgsMap = {};
      for (const org of orgs) {
        orgsMap[org.login] = {
          ...org,
          projects: [],
          projectsFetched: false,
          isExpanded: false,
        };
      }

      organizations.value = orgsMap;
      console.log("Fetched orgs:", orgs);
      return Object.values(organizations.value);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOrgProjects(orgName) {
    if (!orgName || !organizations.value[orgName]) {
      throw new Error("Invalid organization");
    }

    try {
      isLoading.value = true;

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

      const response = await octokit.value.graphql(query, { orgName });
      const projects = response?.data?.organization?.projectsV2?.nodes || [];

      // Update organization with projects
      organizations.value[orgName] = {
        ...organizations.value[orgName],
        projects,
        projectsFetched: true,
      };

      return projects;
    } catch (error) {
      console.error(`Error fetching projects for ${orgName}:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  function selectOrg(orgName) {
    selectedOrg.value = organizations.value[orgName] || null;
  }

  function selectProject(orgName, projectId) {
    const org = organizations.value[orgName];
    if (org) {
      selectedProject.value = org.projects.find(p => p.id === projectId) || null;
    }
  }

  function clearState() {
    organizations.value = {};
    selectedOrg.value = null;
    selectedProject.value = null;
    error.value = null;
    octokit.value = null;
  }

  return {
    organizations,
    selectedOrg,
    selectedProject,
    isLoading,
    error,
    fetchOrganizations,
    fetchOrgProjects,
    selectOrg,
    selectProject,
    clearState,
  };
});
