import { Octokit } from '@octokit/rest';
import { defineStore } from 'pinia';
import { useGithubAppStore } from './useGithubAppStore';

export const useGithubProjectsStore = defineStore('githubProjects', {
    state: () => ({
        userProjects: [],
        orgProjects: {},
        selectedProject: null,
        octokitInstances: {},
        isLoading: false,
        error: null
    }),

    getters: {
        getProjects: (state) => (installationId) => state.orgProjects[installationId] || []
    },

    actions: {
        cleanupProjects(projects) {
            // Create a map to store projects by normalized title
            const projectMap = new Map();

            // Process each project and keep only the latest version of non-closed projects
            projects.forEach((project) => {
                if (project.closed) return; // Skip closed projects

                const normalizedTitle = project.title.toLowerCase();
                const existingProject = projectMap.get(normalizedTitle);

                if (!existingProject || new Date(project.updatedAt) > new Date(existingProject.updatedAt)) {
                    projectMap.set(normalizedTitle, project);
                }
            });

            // Convert map back to array and sort by updatedAt
            return Array.from(projectMap.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        },

        async initializeOctokit(installationId) {
            if (!installationId) {
                throw new Error('Installation ID is required');
            }

            try {
                const githubAppStore = useGithubAppStore();
                const installation = githubAppStore.installations[installationId];

                if (!installation?.access_token) {
                    await githubAppStore.requestInstallationToken(installationId);
                }

                const updatedInstallation = githubAppStore.installations[installationId];

                if (!updatedInstallation?.access_token) {
                    throw new Error('No access token available for this installation');
                }

                if (!this.octokitInstances[installationId]) {
                    this.octokitInstances[installationId] = new Octokit({
                        auth: updatedInstallation.access_token
                    });
                }

                return this.octokitInstances[installationId];
            } catch (error) {
                console.error('Failed to initialize Octokit:', error);
                throw new Error(`Failed to initialize GitHub client: ${error.message}`);
            }
        },

        async executeGraphQLQuery(installationId, query, variables) {
            try {
                const octokit = await this.initializeOctokit(installationId);
                return await octokit.graphql(query, variables);
            } catch (error) {
                if (error.message.includes('Bad credentials')) {
                    const githubAppStore = useGithubAppStore();
                    await githubAppStore.requestInstallationToken(installationId);
                    const octokit = await this.initializeOctokit(installationId);
                    return await octokit.graphql(query, variables);
                }
                throw error;
            }
        },

        async fetchOrgProjects(installationId, orgName) {
            if (!installationId || !orgName) {
                throw new Error('Installation ID and organization name are required');
            }

            try {
                this.isLoading = true;
                const githubAppStore = useGithubAppStore();
                const targetType = githubAppStore.getTargetType(installationId);

                if (!targetType) {
                    throw new Error(`Could not determine target type for installation ${installationId}`);
                }

                const query = `
          query($orgName: String!) {
            ${targetType.toLowerCase()}(login: $orgName) {
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
                const projects = response?.organization?.projectsV2?.nodes || response?.user?.projectsV2?.nodes || [];

                // Clean up projects before storing
                const cleanedProjects = this.cleanupProjects(projects);
                this.orgProjects[installationId] = cleanedProjects;

                return cleanedProjects;
            } catch (error) {
                console.error(`Error fetching projects for org ${orgName}:`, error);
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
        }
    }
});
