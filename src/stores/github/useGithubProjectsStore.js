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

      this.octokit = new Octokit({
        auth: token,
      });
    },

    async fetchUserProjects() {
      try {
        if (!this.octokit) {
          this.initializeOctokit();
        }

        this.isLoading = true;

        // First try the REST API approach
        const { data: projects } = await this.octokit.rest.projects.listForAuthenticatedUser({
          state: "open",
          per_page: 100,
        });

        if (projects && projects.length > 0) {
          this.userProjects = projects.map(project => ({
            id: project.id,
            title: project.name,
            shortDescription: project.body,
            url: project.html_url,
            closed: project.state === "closed",
            updatedAt: project.updated_at,
            number: project.number,
            items: [],
          }));
        } else {
          // Fallback to trying GraphQL for ProjectsV2
          try {
            const { data } = await this.octokit.graphql(`
              query {
                viewer {
                  projectsV2(first: 100) {
                    nodes {
                      id
                      title
                      shortDescription
                      url
                      closed
                      updatedAt
                      number
                    }
                  }
                }
              }
            `);

            if (data?.viewer?.projectsV2?.nodes) {
              this.userProjects = data.viewer.projectsV2.nodes;
            }
          } catch (graphqlError) {
            console.warn("GraphQL projects fetch failed:", graphqlError);
            // If both attempts fail, set empty array but don't throw error
            this.userProjects = [];
          }
        }

        return this.userProjects;
      } catch (error) {
        console.error("Error fetching user projects:", error);
        this.error = error.message;
        // Don't throw the error, just return empty array
        this.userProjects = [];
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProjectDetails(projectId) {
      try {
        if (!this.octokit) {
          this.initializeOctokit();
        }

        this.isLoading = true;

        // First try REST API
        try {
          const { data: project } = await this.octokit.rest.projects.get({
            project_id: projectId,
          });

          if (project) {
            const { data: columns } = await this.octokit.rest.projects.listColumns({
              project_id: projectId,
            });

            this.selectedProject = {
              ...project,
              columns: columns || [],
            };

            return this.selectedProject;
          }
        } catch (restError) {
          console.warn("REST API project fetch failed:", restError);
        }

        // Fallback to GraphQL
        const { data } = await this.octokit.graphql(
          `
          query($projectId: ID!) {
            node(id: $projectId) {
              ... on ProjectV2 {
                id
                title
                shortDescription
                url
                closed
                updatedAt
                number
                owner {
                  ... on Organization {
                    login
                    avatarUrl
                  }
                  ... on User {
                    login
                    avatarUrl
                  }
                }
                fields(first: 20) {
                  nodes {
                    ... on ProjectV2FieldCommon {
                      id
                      name
                      dataType
                    }
                  }
                }
              }
            }
          }
        `,
          {
            projectId,
          }
        );

        if (data?.node) {
          this.selectedProject = data.node;
          return data.node;
        }

        throw new Error("Project not found");
      } catch (error) {
        console.error("Error fetching project details:", error);
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
      this.octokit = null;
    },
  },
});
