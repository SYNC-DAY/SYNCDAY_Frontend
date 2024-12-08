import { defineStore } from "pinia";
import { Octokit } from "@octokit/rest";
import { useGithubAppStore } from "./useGithubAppStore";

export const useGithubProjectsStore = defineStore("githubProjects", {
  state: () => ({
    userProjects: [],
    orgProjects: {},
    selectedProject: null,
    octokitInstances: {}, // Store Octokit instances per installation
    isLoading: false,
    error: null,
  }),

  getters: {
    getOrgProjects: state => orgName => state.orgProjects[orgName] || [],
  },

  actions: {
    async initializeOctokit(installationId) {
      if (!installationId) {
        throw new Error("Installation ID is required");
      }

      try {
        const githubAppStore = useGithubAppStore();
        const installation = githubAppStore.installations[installationId];

        if (!installation?.access_token) {
          // Request new token if not exists
          await githubAppStore.requestInstallationToken(installationId);
        }

        // Get fresh installation data after potential token refresh
        const updatedInstallation = githubAppStore.installations[installationId];

        if (!updatedInstallation?.access_token) {
          throw new Error("No access token available for this installation");
        }

        // Create new Octokit instance with installation token
        if (!this.octokitInstances[installationId]) {
          this.octokitInstances[installationId] = new Octokit({
            auth: updatedInstallation.access_token,
          });
        }

        return this.octokitInstances[installationId];
      } catch (error) {
        console.error("Failed to initialize Octokit:", error);
        throw new Error(`Failed to initialize GitHub client: ${error.message}`);
      }
    },

    async executeGraphQLQuery(installationId, query, variables) {
      try {
        const octokit = await this.initializeOctokit(installationId);
        return await octokit.graphql(query, variables);
      } catch (error) {
        if (error.message.includes("Bad credentials")) {
          // Token might be expired, try to refresh and retry once
          const githubAppStore = useGithubAppStore();
          await githubAppStore.requestInstallationToken(installationId);

          // Retry with new token
          const octokit = await this.initializeOctokit(installationId);
          return await octokit.graphql(query, variables);
        }
        throw error;
      }
    },

    async fetchOrgProjects(installationId, orgName) {
      if (!installationId || !orgName) {
        throw new Error("Installation ID and organization name are required");
      }

      try {
        this.isLoading = true;

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

        const response = await this.executeGraphQLQuery(installationId, query, { orgName });

        if (response?.organization?.projectsV2?.nodes) {
          this.orgProjects[orgName] = response.organization.projectsV2.nodes;
          return this.orgProjects[orgName];
        }

        this.orgProjects[orgName] = [];
        return [];
      } catch (error) {
        console.error(`Error fetching projects for org ${orgName}:`, error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAllOrgProjects(installationId, orgNames) {
      if (!installationId || !Array.isArray(orgNames)) {
        throw new Error("Installation ID and organization names array are required");
      }

      try {
        this.isLoading = true;
        const promises = orgNames.map(orgName =>
          this.fetchOrgProjects(installationId, orgName).catch(error => {
            console.error(`Failed to fetch projects for ${orgName}:`, error);
            return [];
          })
        );

        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching all org projects:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearState() {
      this.userProjects = [];
      this.orgProjects = {};
      this.selectedProject = null;
      this.error = null;
      this.octokitInstances = {};
    },

    clearOrgProjects(orgName) {
      if (orgName) {
        delete this.orgProjects[orgName];
      } else {
        this.orgProjects = {};
      }
    },

    removeOctokitInstance(installationId) {
      delete this.octokitInstances[installationId];
    },
  },
});
