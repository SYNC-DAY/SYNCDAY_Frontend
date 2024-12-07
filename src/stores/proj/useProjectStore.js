import { defineStore } from "pinia";
import axios from "axios";
import { useToast } from "primevue/usetoast";
import { useGithubAppStore } from "../github/useGithubAppStore";
import { ref } from "vue";

export const useProjectStore = defineStore("projectStore", {
  state: () => ({
    currentProject: null,
    projects: [],
    workspaces: [],
    loading: false,
    error: null,
  }),

  getters: {
    getProjectById: state => projectId => {
      return state.projects.find(project => project.proj_id === projectId);
    },

    getWorkspacesByProjectId: state => projectId => {
      return state.workspaces.filter(workspace => workspace.project_id === projectId);
    },

    bookmarkedProjects: state => {
      return state.projects.filter(project => project.bookmark_status === "BOOKMARKED");
    },

    sortedProjects: state => {
      return [...state.projects].sort((a, b) => {
        // First sort by bookmark status
        if (a.bookmark_status === "BOOKMARKED" && b.bookmark_status !== "BOOKMARKED") return -1;
        if (a.bookmark_status !== "BOOKMARKED" && b.bookmark_status === "BOOKMARKED") return 1;
        // Then sort by creation date
        return new Date(b.created_at) - new Date(a.created_at);
      });
    },
  },

  actions: {
    async fetchProjects(userId) {
      const toast = useToast();
      const githubAppStore = useGithubAppStore();
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`/proj-members/users/${userId}`);
        if (!response.data.success) {
          throw new Error(response.data.error || "프로젝트 목록을 불러오는데 실패했습니다");
        }

        const userProjMembers = response.data.data[0]?.proj_member_infos || [];
        this.projects = userProjMembers.map(proj => ({
          proj_id: proj.proj_id,
          proj_name: proj.proj_name,
          bookmark_status: proj.bookmark_status,
          participation_status: proj.participation_status,
          progress_status: proj.progress_status,
          start_time: proj.start_time,
          end_time: proj.end_time,
          created_at: proj.created_at,
          vcs_installation_id: proj.vcs_installation_id,
          vcs_installation: proj.vcs_installation_id ? githubAppStore.getInstallationById(proj.vcs_installation_id) : null,
          vcs_type: proj.vcs_type,
          vcs_proj_url: proj.vcs_proj_url,
          workspaces: proj.workspaces.map(ws => ({
            workspace_id: ws.workspace_id,
            workspace_name: ws.workspace_name,
            created_at: ws.created_at,
            progress_status: ws.progress_status,
            vcs_type: ws.vcs_type,
            vcs_repo_url: ws.vcs_repo_url,
            proj_id: ws.proj_id,
          })),
        }));

        this.workspaces = userProjMembers.flatMap(proj =>
          proj.workspaces.map(ws => ({
            ...ws,
            project_id: proj.proj_id,
          }))
        );

        // Fetch GitHub installations
        await Promise.all(
          this.projects
            .filter(project => project.vcs_installation_id)
            .map(project =>
              githubAppStore.fetchProjectInstallation(project.vcs_installation_id).catch(error => {
                console.error(`Failed to fetch GitHub installation for project ${project.proj_id}:`, error);
              })
            )
        );
      } catch (error) {
        console.error("Projects fetch failed:", error);
        this.error = error.message;
        toast.add({
          severity: "error",
          summary: "로딩 실패",
          detail: "프로젝트 목록을 불러오는데 실패했습니다.",
          life: 3000,
        });
      } finally {
        this.loading = false;
      }
    },

    async updateProjectVCS(userId, projectId, vcsType, vcsUrl) {
      try {
        const response = await axios.patch(`/projects/${projectId}/vcs`, {
          userId,
          vcsType,
          vcsUrl,
        });

        if (response.data.success) {
          // Update current project if it matches
          if (this.currentProject?.proj_id === projectId) {
            this.currentProject = {
              ...this.currentProject,
              vcs_type: vcsType,
              vcs_proj_url: vcsUrl,
            };
          }

          // Update in projects array
          const projectIndex = this.projects.findIndex(p => p.proj_id === projectId);
          if (projectIndex !== -1) {
            this.projects[projectIndex] = {
              ...this.projects[projectIndex],
              vcs_type: vcsType,
              vcs_proj_url: vcsUrl,
            };
          }

          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to update VCS:", error);
        return false;
      }
    },

    async handleBookmarkChange(userId, projId, isBookmarked) {
      const toast = useToast();

      try {
        const response = await axios({
          method: isBookmarked ? "POST" : "DELETE",
          url: "/proj-members/bookmark",
          params: { userId, projId },
        });

        if (response.data.success) {
          const projIndex = this.projects.findIndex(p => p.proj_id === projId);
          if (projIndex !== -1) {
            this.projects[projIndex] = {
              ...this.projects[projIndex],
              bookmark_status: isBookmarked ? "BOOKMARKED" : "NONE",
            };
          }
        } else {
          throw new Error(response.data.error || "북마크 상태 변경에 실패했습니다");
        }
      } catch (error) {
        console.error("Bookmark update failed:", error);
        toast.add({
          severity: "error",
          summary: "북마크 실패",
          detail: "북마크 상태를 변경하는 중 오류가 발생했습니다.",
          life: 3000,
        });
        throw error;
      }
    },

    setCurrentProject(project) {
      this.currentProject = project;
    },

    resetStore() {
      this.currentProject = null;
      this.projects = [];
      this.workspaces = [];
      this.loading = false;
      this.error = null;
    },
  },
});
