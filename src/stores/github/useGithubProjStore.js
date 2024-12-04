// stores/useGithubProjStore.js
import { defineStore } from "pinia";
import axios from "axios";
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
        const token = await githubAppStore.fetchGithubInstallationToken(vcs_installation_id);

        if (!token) {
          throw new Error("Failed to get installation token");
        }

        // Initialize Octokit with the installation token
        const octokit = new Octokit({
          auth: token,
        });

        // Fetch repositories for the installation
        const { data } = await octokit.apps.listReposAccessibleToInstallation();

        // Store the repositories in our state
        this.projects = {
          ...this.projects,
          [vcs_installation_id]: data.repositories.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            description: repo.description,
            html_url: repo.html_url,
            default_branch: repo.default_branch,
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            pushed_at: repo.pushed_at,
            git_url: repo.git_url,
            ssh_url: repo.ssh_url,
            clone_url: repo.clone_url,
            size: repo.size,
            stargazers_count: repo.stargazers_count,
            watchers_count: repo.watchers_count,
            language: repo.language,
            has_issues: repo.has_issues,
            has_projects: repo.has_projects,
            has_downloads: repo.has_downloads,
            has_wiki: repo.has_wiki,
            has_pages: repo.has_pages,
            forks_count: repo.forks_count,
            archived: repo.archived,
            disabled: repo.disabled,
            visibility: repo.visibility,
          })),
        };

        return this.projects[vcs_installation_id];
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        this.error = error.message;
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
