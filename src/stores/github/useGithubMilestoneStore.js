import { defineStore } from "pinia";
import { useGithubAppStore } from "./useGithubAppStore";
import { graphql } from "@octokit/graphql";
import { unref } from "vue";

export const useGithubMilestoneStore = defineStore("githubMilestoneStore", {
	state: () => ({
		milestones: {}, // { [installationId:owner:repo]: milestoneData[] }
		isLoading: false,
		isFetching: false,
		error: null,
		isInitialized: false,
		graphqlClients: {}, // { [installationId]: GraphQLClient }
	}),

	actions: {
		async getGraphQLClient(installationId) {
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
				await this.fetchMilestones(installationId, owner, repo);
				this.isInitialized = true;
			} finally {
				this.isLoading = false;
			}
		},

		async fetchMilestones(installationId, owner, repo) {
			console.log(installationId);
			this.isFetching = true;
			this.error = null;
			const key = `${installationId}:${owner}:${repo}`;

			try {
				// Unwrap any potential refs
				const ownerValue = unref(owner);
				const repoValue = unref(repo);

				const graphqlWithAuth = await this.getGraphQLClient(installationId);

				const query = `
          query getMilestones($owner: String!, $repo: String!) {
            repository(owner: $owner, name: $repo) {
              milestones(first: 100, states: [OPEN], orderBy: {field: DUE_DATE, direction: ASC}) {
                nodes {
                  id
                  number
                  title
                  description
                  dueOn
                  state
                  createdAt
                  updatedAt
                  closed
                  closedAt
                  issues(states: [OPEN, CLOSED]) {
                    totalCount
                  }
                  closedIssues: issues(states: [CLOSED]) {
                    totalCount
                  }
                }
              }
            }
          }
        `;

				const response = await graphqlWithAuth(query, {
					owner: ownerValue,
					repo: repoValue,
				});

				console.log("Milestone response:", response);

				// Process milestones to match the expected format
				const processedMilestones = response.repository.milestones.nodes.map(milestone => ({
					...milestone,
					open_issues: milestone.issues.totalCount - milestone.closedIssues.totalCount,
					closed_issues: milestone.closedIssues.totalCount,
					total_issues: milestone.issues.totalCount,
					progress_percentage: milestone.issues.totalCount === 0 ? 0 : Math.round((milestone.closedIssues.totalCount / milestone.issues.totalCount) * 100),
				}));

				// Update store with new milestones
				this.milestones[key] = processedMilestones;
				return processedMilestones;
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
					this.error = error.message || "Failed to fetch milestones";
				}

				throw error;
			} finally {
				this.isFetching = false;
			}
		},

		async createMilestone(installationId, owner, repo, milestoneData) {
			this.isLoading = true;
			this.error = null;

			try {
				const graphqlWithAuth = await this.getGraphQLClient(installationId);

				const mutation = `
          mutation createMilestone($input: CreateMilestoneInput!) {
            createMilestone(input: $input) {
              milestone {
                id
                number
                title
                description
                dueOn
                state
              }
            }
          }
        `;

				const response = await graphqlWithAuth(mutation, {
					input: {
						repositoryId: await this.getRepositoryId(installationId, unref(owner), unref(repo)),
						title: unref(milestoneData.title),
						description: unref(milestoneData.description),
						dueOn: unref(milestoneData.due_on),
					},
				});

				await this.fetchMilestones(installationId, owner, repo);
				return response.createMilestone.milestone;
			} catch (error) {
				console.error("Create milestone error:", error);
				this.error = error.message || "Failed to create milestone";
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

		async updateMilestone(installationId, owner, repo, milestoneNumber, milestoneData) {
			this.isLoading = true;
			this.error = null;

			try {
				const graphqlWithAuth = await this.getGraphQLClient(installationId);

				const mutation = `
          mutation updateMilestone($input: UpdateMilestoneInput!) {
            updateMilestone(input: $input) {
              milestone {
                id
                number
                title
                description
                dueOn
                state
              }
            }
          }
        `;

				// First get the milestone ID
				const milestone = await this.getMilestoneByNumber(installationId, unref(owner), unref(repo), unref(milestoneNumber));

				if (!milestone) {
					throw new Error("Milestone not found");
				}

				const response = await graphqlWithAuth(mutation, {
					input: {
						milestoneId: milestone.id,
						title: unref(milestoneData.title),
						description: unref(milestoneData.description),
						dueOn: unref(milestoneData.due_on),
						state: unref(milestoneData.state),
					},
				});

				await this.fetchMilestones(installationId, owner, repo);
				return response.updateMilestone.milestone;
			} catch (error) {
				console.error("Update milestone error:", error);
				this.error = error.message || "Failed to update milestone";
				throw error;
			} finally {
				this.isLoading = false;
			}
		},

		async deleteMilestone(installationId, owner, repo, milestoneNumber) {
			this.isLoading = true;
			this.error = null;

			try {
				const graphqlWithAuth = await this.getGraphQLClient(installationId);

				// First get the milestone ID
				const milestone = await this.getMilestoneByNumber(installationId, unref(owner), unref(repo), unref(milestoneNumber));

				if (!milestone) {
					throw new Error("Milestone not found");
				}

				const mutation = `
          mutation deleteMilestone($input: DeleteMilestoneInput!) {
            deleteMilestone(input: $input) {
              clientMutationId
            }
          }
        `;

				await graphqlWithAuth(mutation, {
					input: {
						milestoneId: milestone.id,
					},
				});

				// Remove from local state
				const key = `${installationId}:${owner}:${repo}`;
				if (this.milestones[key]) {
					this.milestones[key] = this.milestones[key].filter(m => m.number !== milestoneNumber);
				}
				return true;
			} catch (error) {
				console.error("Delete milestone error:", error);
				this.error = error.message || "Failed to delete milestone";
				throw error;
			} finally {
				this.isLoading = false;
			}
		},

		clearMilestones(installationId, owner, repo) {
			const key = `${installationId}:${owner}:${repo}`;
			this.milestones[key] = [];
			this.error = null;
		},
	},

	getters: {
		isLoadingAny: state => state.isLoading || state.isFetching,

		getMilestones: state => (installationId, owner, repo) => {
			const key = `${installationId}:${owner}:${repo}`;
			return state.milestones[key] || [];
		},

		getMilestoneById: state => (installationId, owner, repo, milestoneId) => {
			const key = `${installationId}:${owner}:${repo}`;
			return state.milestones[key]?.find(m => m.id === milestoneId);
		},

		getMilestoneByNumber: state => (installationId, owner, repo, milestoneNumber) => {
			const key = `${installationId}:${owner}:${repo}`;
			return state.milestones[key]?.find(m => m.number === milestoneNumber);
		},

		hasMilestones: state => (installationId, owner, repo) => {
			const key = `${installationId}:${owner}:${repo}`;
			return (state.milestones[key]?.length || 0) > 0;
		},
	},
});
