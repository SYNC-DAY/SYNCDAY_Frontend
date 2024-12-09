// stores/githubIssueStore.js
import { defineStore } from "pinia";

export const useGithubIssueStore = defineStore("githubIssue", {
  state: () => ({
    issues: {}, // Keyed by `${installationId}-${owner}-${repo}`
    isLoading: false,
    error: null,
  }),

  getters: {
    getIssues: state => (installationId, owner, repo) => {
      const key = `${installationId}-${owner}-${repo}`;
      return state.issues[key] || [];
    },

    getIssuesByMilestone: state => (installationId, owner, repo, milestoneNumber) => {
      const key = `${installationId}-${owner}-${repo}`;
      return state.issues[key]?.filter(issue => issue.milestone?.number === milestoneNumber) || [];
    },
  },

  actions: {
    async fetchIssues(installationId, owner, repo, { milestone = null, state = "all" } = {}) {
      if (!installationId || !owner || !repo) {
        throw new Error("Installation ID, owner, and repo are required");
      }

      try {
        this.isLoading = true;
        const query = `
          query($owner: String!, $repo: String!, $states: [IssueState!]) {
            repository(owner: $owner, name: $repo) {
              issues(first: 100, states: $states, orderBy: {field: UPDATED_AT, direction: DESC}) {
                nodes {
                  id
                  number
                  title
                  body
                  state
                  createdAt
                  updatedAt
                  closedAt
                  author {
                    login
                  }
                  assignees(first: 10) {
                    nodes {
                      login
                    }
                  }
                  labels(first: 10) {
                    nodes {
                      name
                      color
                    }
                  }
                  milestone {
                    number
                    title
                  }
                }
              }
            }
          }
        `;

        const states = state === "all" ? ["OPEN", "CLOSED"] : [state.toUpperCase()];
        const response = await this.executeGraphQLQuery(installationId, query, {
          owner,
          repo,
          states,
        });

        const issues = response?.repository?.issues?.nodes || [];
        const transformedIssues = issues.map(issue => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state.toLowerCase(),
          created_at: issue.createdAt,
          updated_at: issue.updatedAt,
          closed_at: issue.closedAt,
          author: issue.author.login,
          assignees: issue.assignees.nodes.map(node => node.login),
          labels: issue.labels.nodes.map(label => ({
            name: label.name,
            color: label.color,
          })),
          milestone: issue.milestone
            ? {
                number: issue.milestone.number,
                title: issue.milestone.title,
              }
            : null,
        }));

        const key = `${installationId}-${owner}-${repo}`;
        this.issues[key] = transformedIssues;
        return transformedIssues;
      } catch (error) {
        console.error(`Error fetching issues for ${owner}/${repo}:`, error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createIssue(installationId, owner, repo, { title, body, assignees = [], labels = [], milestone = null }) {
      if (!installationId || !owner || !repo) {
        throw new Error("Installation ID, owner, and repo are required");
      }

      try {
        this.isLoading = true;
        const mutation = `
          mutation($input: CreateIssueInput!) {
            createIssue(input: $input) {
              issue {
                id
                number
              }
            }
          }
        `;

        const response = await this.executeGraphQLQuery(installationId, mutation, {
          input: {
            repositoryId: `${owner}/${repo}`,
            title,
            body,
            assigneeIds: assignees,
            labelIds: labels,
            milestoneId: milestone,
          },
        });

        // Refresh issues after creation
        await this.fetchIssues(installationId, owner, repo);
        return response?.createIssue?.issue;
      } catch (error) {
        console.error(`Error creating issue in ${owner}/${repo}:`, error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateIssue(installationId, owner, repo, issueNumber, updates) {
      if (!installationId || !owner || !repo || !issueNumber) {
        throw new Error("Installation ID, owner, repo, and issue number are required");
      }

      try {
        this.isLoading = true;
        const mutation = `
          mutation($input: UpdateIssueInput!) {
            updateIssue(input: $input) {
              issue {
                id
                number
              }
            }
          }
        `;

        const response = await this.executeGraphQLQuery(installationId, mutation, {
          input: {
            id: issueNumber,
            ...updates,
          },
        });

        // Refresh issues after update
        await this.fetchIssues(installationId, owner, repo);
        return response?.updateIssue?.issue;
      } catch (error) {
        console.error(`Error updating issue ${issueNumber} in ${owner}/${repo}:`, error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
