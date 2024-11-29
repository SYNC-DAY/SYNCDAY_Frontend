import { defineStore } from "pinia";
import { useGithubAuthStore } from "./useGithubAuthStore";
import { Octokit } from "@octokit/rest";

export const useGithubProjectsStore = defineStore("githubProjects", {
  state: () => ({
    userProjects: [],
    orgProjects: {},
    selectedProject: null,
    octokit: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getOrgProjects: state => orgName => state.orgProjects[orgName] || [],
  },

  actions: {
    initializeOctokit() {
      const authStore = useGithubAuthStore();
      const token = authStore.accessToken;

      if (!token) {
        throw new Error("No access token available");
      }

      if (!this.octokit) {
        this.octokit = new Octokit({
          auth: token,
        });
      }

      return this.octokit;
    },

    async fetchOrgProjects(orgName) {
      if (!orgName) {
        throw new Error("Organization name is required");
      }

      try {
        this.isLoading = true;
        const octokit = this.initializeOctokit();

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

        const response = await octokit.graphql(query, {
          orgName,
        });

        console.log(`Response for ${orgName}:`, response);

        if (response?.data?.organization?.projectsV2?.nodes) {
          this.orgProjects[orgName] = response.data.organization.projectsV2.nodes;
          return this.orgProjects[orgName];
        }

        this.orgProjects[orgName] = [];
        return [];
      } catch (error) {
        console.error(`Error fetching projects for org ${orgName}:`, error);
        this.error = error.message;
        this.orgProjects[orgName] = [];
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAllOrgProjects(orgNames) {
      try {
        this.isLoading = true;
        const promises = orgNames.map(orgName => this.fetchOrgProjects(orgName));
        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching all org projects:", error);
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    clearState() {
      this.userProjects = [];
      this.orgProjects = {};
      this.selectedProject = null;
      this.error = null;
      this.octokit = null;
    },

    clearOrgProjects(orgName) {
      if (orgName) {
        delete this.orgProjects[orgName];
      } else {
        this.orgProjects = {};
      }
    },
  },
});
