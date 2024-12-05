// stores/useGithubProjStore.js
import { defineStore } from "pinia";
import { useGithubAppStore } from "./useGithubAppStore";
import { Octokit } from "@octokit/rest";

export const useGithubProjStore = defineStore("githubProj", {
  state: () => ({
    projects: {},
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchProjects(vcs_installation_id) {
      this.isLoading = true;
      this.error = null;

      try {
        const githubAppStore = useGithubAppStore();
        const token = githubAppStore.getInstallationById(vcs_installation_id);
        console.log(token);
        console.log(typeof token.installation_token);
        console.log(token.installation_token);
        if (!token) {
          throw new Error("Failed to get installation token");
        }

        const octokit = new Octokit({
          auth: token,
        });

        // Get the installation
        const installation = githubAppStore.getInstallationById(vcs_installation_id);
        if (!installation) {
          throw new Error("Installation not found");
        }

        // Get the organization name from the installation
        const orgName = installation.account.login;

        // Fetch all projects for the organization
        const { data } = await octokit.request("GET /orgs/{org}/projects", {
          org: orgName,
          state: "all",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        const projectsData = data.map(project => ({
          id: project.id,
          name: project.name,
          body: project.body,
          number: project.number,
          state: project.state,
          creator: project.creator,
          created_at: project.created_at,
          updated_at: project.updated_at,
          organization_permission: project.organization_permission,
          html_url: project.html_url,
        }));

        // Update the store
        this.projects = {
          ...this.projects,
          [vcs_installation_id]: projectsData,
        };

        return projectsData;
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        this.error = error.message || "Failed to fetch projects";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    getProjectsByInstallation(vcs_installation_id) {
      return this.projects[vcs_installation_id] || [];
    },
  },

  getters: {
    hasProjects: state => Object.keys(state.projects).length > 0,
    getProjectCount: state => vcs_installation_id => state.projects[vcs_installation_id]?.length || 0,
  },
});
