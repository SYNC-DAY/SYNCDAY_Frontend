import { defineStore } from "pinia";
import { Octokit } from "@octokit/rest";
import { useGithubAppStore } from "./useGithubAppStore";

export const useGithubRepoStore = defineStore("githubRepo", {
  state: () => ({
    repositories: {}, // Keyed by installationId
    octokitInstances: {},
    isLoading: false,
    error: null,
  }),

  actions: {
    async initializeOctokit(installationId) {
      if (!installationId) {
        throw new Error("Installation ID is required");
      }

      try {
        const githubAppStore = useGithubAppStore();
        const installation = githubAppStore.installations[installationId];

        if (!installation?.access_token) {
          await githubAppStore.requestInstallationToken(installationId);
        }

        const updatedInstallation = githubAppStore.installations[installationId];

        if (!updatedInstallation?.access_token) {
          throw new Error("No access token available for this installation");
        }

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
          const githubAppStore = useGithubAppStore();
          await githubAppStore.requestInstallationToken(installationId);
          const octokit = await this.initializeOctokit(installationId);
          return await octokit.graphql(query, variables);
        }
        throw error;
      }
    },

    async fetchRepositories(installationId) {
      if (!installationId) {
        throw new Error("Installation ID is required");
      }

      try {
        this.isLoading = true;
        const githubAppStore = useGithubAppStore();
        const targetType = githubAppStore.getTargetType(installationId);
        const accountName = githubAppStore.getLogin(installationId);
        console.log("Account Name:", accountName); // Log the correct variable
        if (!targetType) {
          throw new Error(`Could not determine target type for installation ${installationId}`);
        }

        // GraphQL query to fetch repositories
        const query = `
          query($login: String!) {
            ${targetType.toLowerCase()}(login: $login) {
              repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
                nodes {
                  id
                  name
                  fullName: nameWithOwner
                  url
                  description
                  updatedAt
                  primaryLanguage {
                    name
                  }
                  defaultBranchRef {
                    name
                  }
                }
              }
            }
          }
        `;

        const response = await this.executeGraphQLQuery(installationId, query, {
          login: accountName,
        });

        const repositories = response?.[targetType.toLowerCase()]?.repositories?.nodes || [];

        // Transform the response to match the expected format
        const transformedRepos = repositories.map(repo => ({
          id: repo.id,
          name: repo.name,
          accountName: accountName,
          full_name: repo.fullName,
          private: repo.private,
          html_url: repo.url,
          description: repo.description,
          updated_at: repo.updatedAt,
          language: repo.primaryLanguage?.name,
          default_branch: repo.defaultBranchRef?.name,
        }));

        this.repositories[installationId] = transformedRepos;
        return transformedRepos;
      } catch (error) {
        console.error(`Error fetching repositories for installation ${installationId}:`, error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    saveRepositories(installationId, repositories) {
      if (!Array.isArray(repositories)) {
        throw new Error("Repositories must be an array");
      }
      this.repositories[installationId] = repositories;
    },

    getRepositoriesByInstallation(installationId) {
      return this.repositories[installationId] || [];
    },

    clearRepositories(installationId) {
      if (installationId) {
        delete this.repositories[installationId];
        this.removeOctokitInstance(installationId);
      } else {
        this.repositories = {};
        this.octokitInstances = {};
      }
    },

    removeOctokitInstance(installationId) {
      delete this.octokitInstances[installationId];
    },
  },

  getters: {
    getAllRepositories: state => state.repositories,

    getRepositoryCount: state => installationId => {
      const repos = state.repositories[installationId];
      return repos ? repos.length : 0;
    },

    hasRepositories: state => installationId => {
      return !!state.repositories[installationId]?.length;
    },

    isLoadingRepositories: state => state.isLoading,

    getError: state => state.error,
    getRepoName: state => installationId => {
      return state.repositories[installationId].repoName;
    },
    getOwnerName: state => installationId => {
      return state.repositories[installationId].owner;
    },
  },
});
