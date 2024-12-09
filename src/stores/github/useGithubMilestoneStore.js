import { defineStore } from "pinia";
import { useGithubAppStore } from "./useGithubAppStore";
import { useGithubRepoStore } from "./useGithubRepoStore";
export const useGithubMilestoneStore = defineStore("githubMilestone", {
  state: () => ({
    milestones: {}, // Keyed by `${owner}-${repo}`
    isLoading: false,
    error: null,
  }),

  getters: {
    getMilestones: state => (owner, repo) => {
      const key = `${owner}-${repo}`;
      return state.milestones[key] || [];
    },
  },

  actions: {
    async fetchMilestones(installationId) {
      const githubAppStore = useGithubAppStore();
      const githubRepoStore = useGithubRepoStore();
      if (!installationId) {
        throw new Error("No active GitHub installation found");
      }
      const owner = await githubRepoStore.getOwnerName(installationId);
      const repo = await githubRepoStore.getRepoName(installationId);
      try {
        this.isLoading = true;

        const query = `
          query($owner: String!, $repo: String!) {
            repository(owner: $owner, name: $repo) {
              milestones(first: 100, orderBy: {field: DUE_DATE, direction: DESC}) {
                nodes {
                  id
                  number
                  title
                  description
                  dueOn
                  state
                  closedAt
                  progressPercentage: closed
                  totalIssueCount: issues {
                    totalCount
                  }
                  openIssueCount: issues(states: OPEN) {
                    totalCount
                  }
                }
              }
            }
          }
        `;

        const response = await this.executeGraphQLQuery(installationId, query, {
          owner,
          repo,
        });

        const milestones = response?.repository?.milestones?.nodes || [];
        const transformedMilestones = milestones.map(milestone => ({
          id: milestone.id,
          number: milestone.number,
          title: milestone.title,
          description: milestone.description,
          due_on: milestone.dueOn,
          state: milestone.state.toLowerCase(),
          closed_at: milestone.closedAt,
          progress_percentage: milestone.progressPercentage,
          total_issues: milestone.totalIssueCount.totalCount,
          open_issues: milestone.openIssueCount.totalCount,
        }));

        const key = `${owner}-${repo}`;
        this.milestones[key] = transformedMilestones;
        return transformedMilestones;
      } catch (error) {
        console.error(`Error fetching milestones for ${owner}/${repo}:`, error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createMilestone(owner, repo, { title, description, dueOn }) {
      const githubAppStore = useGithubAppStore();
      const installationId = githubAppStore.installationId;

      if (!installationId) {
        throw new Error("No active GitHub installation found");
      }

      if (!owner || !repo) {
        throw new Error("Owner and repo are required");
      }

      try {
        this.isLoading = true;
        const mutation = `
          mutation($input: CreateMilestoneInput!) {
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

        const response = await this.executeGraphQLQuery(installationId, mutation, {
          input: {
            repositoryId: `${owner}/${repo}`,
            title,
            description,
            dueOn,
          },
        });

        // Refresh milestones after creation
        await this.fetchMilestones(owner, repo);
        return response?.createMilestone?.milestone;
      } catch (error) {
        console.error(`Error creating milestone in ${owner}/${repo}:`, error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateMilestone(owner, repo, milestoneNumber, updates) {
      const githubAppStore = useGithubAppStore();
      const installationId = githubAppStore.installationId;

      if (!installationId) {
        throw new Error("No active GitHub installation found");
      }

      if (!owner || !repo || !milestoneNumber) {
        throw new Error("Owner, repo, and milestone number are required");
      }

      try {
        this.isLoading = true;
        const mutation = `
          mutation($input: UpdateMilestoneInput!) {
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

        const response = await this.executeGraphQLQuery(installationId, mutation, {
          input: {
            milestoneId: milestoneNumber,
            ...updates,
          },
        });

        // Refresh milestones after update
        await this.fetchMilestones(owner, repo);
        return response?.updateMilestone?.milestone;
      } catch (error) {
        console.error(`Error updating milestone ${milestoneNumber} in ${owner}/${repo}:`, error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
