import { defineStore } from "pinia";
import { useGithubAppStore } from "./useGithubAppStore";
import { graphql } from "@octokit/graphql";
import { unref } from "vue";

export const useGithubIssueStore = defineStore("githubIssueStore", {
	state: () => ({
		issues: {}, // { [installationId:owner:repo]: issueData[] }
		isLoading: false,
		isFetching: false,
		error: null,
		isInitialized: false,
		graphqlClients: {}, // { [installationId]: GraphQLClient }
	}),

	actions: {
		async getGraphQLClient(installationId) {
			console.log(installationId);
			try {
				const githubAppStore = useGithubAppStore();
				const installation = githubAppStore.installations[installationId];

				if (!installation?.access_token) {
					console.log("No access token found, requesting new token...");
					await githubAppStore.requestInstallationToken(installationId);
				}

				const updatedInstallation = githubAppStore.installations[installationId];

				if (!updatedInstallation?.access_token) {
					throw new Error("No access token available for this installation");
				}

				// Always create a new instance to ensure fresh token
				this.graphqlClients[installationId] = graphql.defaults({
					headers: {
						authorization: `token ${updatedInstallation.access_token}`,
					},
				});

				return this.graphqlClients[installationId];
			} catch (error) {
				console.error("Failed to initialize GraphQL client:", error);
				throw new Error(`Failed to initialize GitHub client: ${error.message}`);
			}
		},

		async initializeStore(installationId, owner, repo) {
			if (this.isInitialized) return;

			this.isLoading = true;
			try {
				await this.fetchIssues(installationId, owner, repo);
				this.isInitialized = true;
			} finally {
				this.isLoading = false;
			}
		},

		async fetchIssues(installationId, owner, repo, { milestone = null, state = "OPEN", labels = [] } = {}) {
			this.isFetching = true;
			this.error = null;
			const key = `${installationId}:${owner}:${repo}`;

			try {
				const ownerValue = unref(owner);
				const repoValue = unref(repo);
				const graphqlWithAuth = await this.getGraphQLClient(installationId);

				const query = `
          query getIssues($owner: String!, $repo: String!, $labels: [String!], $states: [IssueState!]) {
            repository(owner: $owner, name: $repo) {
              issues(first: 100, states: $states, labels: $labels, orderBy: {field: CREATED_AT, direction: DESC}) {
                nodes {
                  id
                  number
                  title
                  body
                  state
                  createdAt
                  updatedAt
                  closedAt
                  url
                  labels(first: 10) {
                    nodes {
                      id
                      name
                      color
                      description
                    }
                  }
                  assignees(first: 5) {
                    nodes {
                      id
                      login
                      avatarUrl
                    }
                  }
                  milestone {
                    id
                    number
                    title
                    description
                    dueOn
                    state
                  }
                  author {
                    login
                    avatarUrl
                  }
                  comments(first: 1) {
                    totalCount
                  }
                }
              }
            }
          }
        `;

				const variables = {
					owner: ownerValue,
					repo: repoValue,
					labels: labels.map(unref),
					states: [unref(state)],
				};

				const response = await graphqlWithAuth(query, variables);

				// Process issues to match expected format
				const processedIssues = response.repository.issues.nodes.map(issue => ({
					...issue,
					labels: issue.labels.nodes,
					assignees: issue.assignees.nodes,
					comments_count: issue.comments.totalCount,
				}));

				// Filter by milestone if specified
				const filteredIssues = milestone ? processedIssues.filter(issue => issue.milestone?.number === unref(milestone)) : processedIssues;

				// Update store with new issues
				this.issues[key] = filteredIssues;
				return filteredIssues;
			} catch (error) {
				console.error("GraphQL error:", {
					errors: error.errors,
					owner: unref(owner),
					repo: unref(repo),
				});

				if (error.errors?.[0]?.type === "NOT_FOUND") {
					this.error = `Repository ${unref(owner)}/${unref(repo)} not found or no access`;
				} else if (error.errors?.[0]?.type === "FORBIDDEN") {
					this.error = "Authentication failed - please check permissions";
				} else {
					this.error = error.message || "Failed to fetch issues";
				}

				throw error;
			} finally {
				this.isFetching = false;
			}
		},
		async fetchIssuesByMilestone(installationId, owner, repo, milestoneNumber) {
			this.isFetching = true;
			this.error = null;
			const key = `${installationId}:${owner}:${repo}`;

			try {
				const ownerValue = unref(owner);
				const repoValue = unref(repo);
				const milestoneNumberValue = unref(milestoneNumber);
				const graphqlWithAuth = await this.getGraphQLClient(installationId);

				const query = `
          query getIssuesByMilestone($owner: String!, $repo: String!, $milestoneNumber: Int!) {
            repository(owner: $owner, name: $repo) {
              milestone(number: $milestoneNumber) {
                issues(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
                  nodes {
                    id
                    number
                    title
                    body
                    state
                    createdAt
                    updatedAt
                    closedAt
                    url
                    labels(first: 10) {
                      nodes {
                        id
                        name
                        color
                        description
                      }
                    }
                    assignees(first: 5) {
                      nodes {
                        id
                        login
                        avatarUrl
                      }
                    }
                    milestone {
                      id
                      number
                      title
                      description
                      dueOn
                      state
                    }
                    author {
                      login
                      avatarUrl
                    }
                    comments(first: 1) {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        `;

				const response = await graphqlWithAuth(query, {
					owner: ownerValue,
					repo: repoValue,
					milestoneNumber: milestoneNumberValue,
				});

				// Process issues to match expected format
				const processedIssues = response.repository.milestone.issues.nodes.map(issue => ({
					...issue,
					labels: issue.labels.nodes,
					assignees: issue.assignees.nodes,
					comments_count: issue.comments.totalCount,
				}));

				// Update store with new issues
				this.issues[key] = processedIssues;
				return processedIssues;
			} catch (error) {
				console.error("GraphQL error:", {
					errors: error.errors,
					owner: unref(owner),
					repo: unref(repo),
					milestoneNumber: unref(milestoneNumber),
				});

				if (error.errors?.[0]?.type === "NOT_FOUND") {
					this.error = `Repository or milestone not found`;
				} else if (error.errors?.[0]?.type === "FORBIDDEN") {
					this.error = "Authentication failed - please check permissions";
				} else {
					this.error = error.message || "Failed to fetch milestone issues";
				}

				throw error;
			} finally {
				this.isFetching = false;
			}
		},
		async createIssue(installationId, owner, repo, issueData) {
			this.isLoading = true;
			this.error = null;

			try {
				const graphqlWithAuth = await this.getGraphQLClient(installationId);

				const mutation = `
          mutation createIssue($input: CreateIssueInput!) {
            createIssue(input: $input) {
              issue {
                id
                number
                title
                state
                url
              }
            }
          }
        `;

				const repositoryId = await this.getRepositoryId(installationId, owner, repo);

				const response = await graphqlWithAuth(mutation, {
					input: {
						repositoryId,
						title: unref(issueData.title),
						body: unref(issueData.body),
						assigneeIds: issueData.assignees?.map(unref),
						labelIds: issueData.labels?.map(unref),
						milestoneId: unref(issueData.milestone_id),
					},
				});

				await this.fetchIssues(installationId, owner, repo);
				return response.createIssue.issue;
			} catch (error) {
				console.error("Create issue error:", error);
				this.error = error.message || "Failed to create issue";
				throw error;
			} finally {
				this.isLoading = false;
			}
		},

		async updateIssue(installationId, owner, repo, issueNumber, issueData) {
			this.isLoading = true;
			this.error = null;

			try {
				const graphqlWithAuth = await this.getGraphQLClient(installationId);

				const mutation = `
          mutation updateIssue($input: UpdateIssueInput!) {
            updateIssue(input: $input) {
              issue {
                id
                number
                title
                state
                url
              }
            }
          }
        `;

				// Get issue ID first
				const issue = await this.getIssueByNumber(installationId, owner, repo, issueNumber);

				if (!issue) {
					throw new Error("Issue not found");
				}

				const response = await graphqlWithAuth(mutation, {
					input: {
						id: issue.id,
						title: unref(issueData.title),
						body: unref(issueData.body),
						assigneeIds: issueData.assignees?.map(unref),
						labelIds: issueData.labels?.map(unref),
						milestoneId: unref(issueData.milestone_id),
						state: unref(issueData.state),
					},
				});

				await this.fetchIssues(installationId, owner, repo);
				return response.updateIssue.issue;
			} catch (error) {
				console.error("Update issue error:", error);
				this.error = error.message || "Failed to update issue";
				throw error;
			} finally {
				this.isLoading = false;
			}
		},

		async getRepositoryId(installationId, owner, repo) {
			const graphqlWithAuth = await this.getGraphQLClient(installationId);

			const query = `
        query getRepoId($owner: String!, $repo: String!) {
          repository(owner: $owner, name: $repo) {
            id
          }
        }
      `;

			const response = await graphqlWithAuth(query, {
				owner: unref(owner),
				repo: unref(repo),
			});

			return response.repository.id;
		},

		async closeIssue(installationId, owner, repo, issueNumber) {
			return this.updateIssue(installationId, owner, repo, issueNumber, { state: "CLOSED" });
		},

		async reopenIssue(installationId, owner, repo, issueNumber) {
			return this.updateIssue(installationId, owner, repo, issueNumber, { state: "OPEN" });
		},

		clearIssues(installationId, owner, repo) {
			const key = `${installationId}:${owner}:${repo}`;
			this.issues[key] = [];
			this.error = null;
		},
	},

	getters: {
		isLoadingAny: state => state.isLoading || state.isFetching,

		getIssues: state => (installationId, owner, repo) => {
			const key = `${installationId}:${owner}:${repo}`;
			return state.issues[key] || [];
		},

		getIssueById: state => (installationId, owner, repo, issueId) => {
			const key = `${installationId}:${owner}:${repo}`;
			return state.issues[key]?.find(issue => issue.id === issueId);
		},

		getIssueByNumber: state => (installationId, owner, repo, issueNumber) => {
			const key = `${installationId}:${owner}:${repo}`;
			return state.issues[key]?.find(issue => issue.number === issueNumber);
		},

		hasIssues: state => (installationId, owner, repo) => {
			const key = `${installationId}:${owner}:${repo}`;
			return (state.issues[key]?.length || 0) > 0;
		},
	},
});
