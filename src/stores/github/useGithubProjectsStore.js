// src/stores/github/useGithubProjectsStore.js
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

        // Fetch user's projects using GraphQL
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
                  items(first: 20) {
                    nodes {
                      id
                      fieldValues(first: 8) {
                        nodes {
                          ... on ProjectV2ItemFieldTextValue {
                            text
                            field { ... on ProjectV2FieldCommon { name } }
                          }
                          ... on ProjectV2ItemFieldDateValue {
                            date
                            field { ... on ProjectV2FieldCommon { name } }
                          }
                          ... on ProjectV2ItemFieldSingleSelectValue {
                            name
                            field { ... on ProjectV2FieldCommon { name } }
                          }
                        }
                      }
                      content {
                        ... on Issue {
                          title
                          state
                          number
                        }
                        ... on PullRequest {
                          title
                          state
                          number
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `);

        this.userProjects = data.viewer.projectsV2.nodes;
        return this.userProjects;
      } catch (error) {
        console.error("Error fetching user projects:", error);
        this.error = error.message;
        throw error;
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

        // Fetch detailed project information using GraphQL
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
                    ... on ProjectV2SingleSelectField {
                      id
                      name
                      options {
                        id
                        name
                        color
                      }
                    }
                  }
                }
                items(first: 100) {
                  nodes {
                    id
                    fieldValues(first: 20) {
                      nodes {
                        ... on ProjectV2ItemFieldTextValue {
                          text
                          field { ... on ProjectV2FieldCommon { name } }
                        }
                        ... on ProjectV2ItemFieldDateValue {
                          date
                          field { ... on ProjectV2FieldCommon { name } }
                        }
                        ... on ProjectV2ItemFieldSingleSelectValue {
                          name
                          field { ... on ProjectV2FieldCommon { name } }
                        }
                      }
                    }
                    content {
                      ... on Issue {
                        title
                        body
                        state
                        number
                        repository {
                          name
                          owner {
                            login
                          }
                        }
                        labels(first: 10) {
                          nodes {
                            name
                            color
                          }
                        }
                        assignees(first: 5) {
                          nodes {
                            login
                            avatarUrl
                          }
                        }
                      }
                      ... on PullRequest {
                        title
                        body
                        state
                        number
                        repository {
                          name
                          owner {
                            login
                          }
                        }
                        labels(first: 10) {
                          nodes {
                            name
                            color
                          }
                        }
                        assignees(first: 5) {
                          nodes {
                            login
                            avatarUrl
                          }
                        }
                      }
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

        this.selectedProject = data.node;
        return data.node;
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
