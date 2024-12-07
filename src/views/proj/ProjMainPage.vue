<template>
  <SideBar>
    <!-- Project List -->
    <template v-for="proj in projStore.projects" :key="proj.proj_id">
      <ProjItem :title="proj.proj_name" :isActive="activeProject === proj.proj_id"
        :initialBookmarked="proj.bookmark_status === 'BOOKMARKED'" :progress="proj.progress_status"
        :isExpanded="expandedProjects.includes(proj.proj_id)" @toggle-expansion="toggleProjectExpansion(proj.proj_id)"
        @select="selectProject(proj.proj_id)" @bookmark-changed="handleBookmarkChange(proj.proj_id, $event)">
        <!-- Workspace List -->
        <template v-for="workspace in proj.workspaces" :key="workspace.workspace_id">
          <WorkspaceItem :workspaceId="workspace.workspace_id" :projectId="proj.proj_id"
            :title="workspace.workspace_name" :isActive="activeWorkspace === workspace.workspace_id"
            :progress="workspace.progress_status" :initialBookmarked="workspace.bookmark_status === 'BOOKMARKED'"
            @select="selectWorkspace" @bookmark-changed="handleWorkspaceBookmark(workspace.workspace_id, $event)" />
        </template>
      </ProjItem>
    </template>

    <!-- New Project Button -->
    <div class="container-row justify-center" style="padding: 1rem">
      <Button label="New Project" icon="pi pi-plus" @click="showNewProjModal = true" />
    </div>
  </SideBar>

  <!-- New Project Modal -->
  <NewProjModal v-model:visible="showNewProjModal" @submit="handleProjectSubmit" />

  <!-- Project Settings Modal -->
  <!-- Main Content Area -->
  <div class="proj-main">
    <router-view :projects="projects" />
  </div>
</template>

<script setup>
import { ref, onMounted, provide, nextTick } from 'vue';
import { useAuthStore } from "@/stores/auth.js";

import { useGithubAppStore } from '@/stores/github/useGithubAppStore';

import { storeToRefs } from "pinia";
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';

import SideBar from '@/components/SideBar.vue';
import ProjItem from './sidebar/ProjItem.vue';
import WorkspaceItem from './sidebar/WorkspaceItem.vue';
import NewProjModal from './components/NewProjModal.vue';
import { useProjectStore } from '@/stores/proj/useProjectStore';

// Initialize services
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const githubAppStore = useGithubAppStore();
const projStore = useProjectStore();
const { user } = storeToRefs(authStore);

// State management
const projects = ref([]);
const workspaces = ref([]);
provide('projects', projects);
provide('workspaces', workspaces);

const activeWorkspace = ref(null);
const activeProject = ref(null);
const expandedProjects = ref([]);
const showNewProjModal = ref(false);


// Project submission handler
const handleProjectSubmit = async (projectData) => {
  try {
    console.log(projectData);
    const response = await axios.post("/projs/", {
      user_id: user.value.userId,
      proj_name: projectData.name,
      start_time: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
      end_time: projectData.endDate ? new Date(projectData.endDate).toISOString() : null
    });

    if (response.data.success) {
      // Add new project to local state
      const newProject = {
        proj_id: response.data.data.proj_id,
        proj_name: projectData.name,
        start_time: projectData.startDate,
        end_time: projectData.endDate,
        progress_status: 0,
        bookmark_status: 'NONE',
        participation_status: 'OWNER',
        created_at: new Date().toISOString(),
        workspaces: []
      };

      projects.value.push(newProject);

      toast.add({
        severity: 'success',
        summary: '프로젝트 생성 성공',
        detail: '새 프로젝트가 생성되었습니다.',
        life: 3000
      });

      // Auto-select the new project
      nextTick(() => {
        selectProject(newProject.proj_id);
      });

    } else {
      throw new Error(response.data.message || '프로젝트 생성에 실패했습니다.');
    }
  } catch (error) {
    console.error('Project creation failed:', error);
    toast.add({
      severity: 'error',
      summary: '프로젝트 생성 실패',
      detail: error.message || '프로젝트 생성 중 오류가 발생했습니다.',
      life: 3000
    });
  }
};

// Navigation handlers
const selectWorkspace = async (workspaceId, projId) => {
  try {
    activeWorkspace.value = workspaceId;
    activeProject.value = projId;

    await router.push({
      name: 'Workspace',
      params: {
        projectId: projId,
        workspaceId: workspaceId
      }
    });
  } catch (err) {
    console.error('Workspace navigation failed:', err);
    toast.add({
      severity: 'error',
      summary: '이동 실패',
      detail: '워크스페이스로 이동하는 중 오류가 발생했습니다.',
      life: 3000
    });
  }
};

const selectProject = async (projId) => {
  try {
    activeProject.value = projId;
    activeWorkspace.value = null;
    await router.push({
      name: 'Project',
      params: { projectId: projId }
    });
  } catch (err) {
    console.error('Project navigation failed:', err);
    toast.add({
      severity: 'error',
      summary: '이동 실패',
      detail: '프로젝트로 이동하는 중 오류가 발생했습니다.',
      life: 3000
    });
  }
};

// Project expansion handler
const toggleProjectExpansion = (projId) => {
  const index = expandedProjects.value.indexOf(projId);
  if (index === -1) {
    expandedProjects.value.push(projId);
  } else {
    expandedProjects.value.splice(index, 1);
  }
};

// Bookmark handlers
const handleBookmarkChange = async (projId, isBookmarked) => {
  try {
    const response = await axios({
      method: isBookmarked ? 'POST' : 'DELETE',
      url: '/proj-members/bookmark',
      params: {
        userId: user.value.userId,
        projId: projId
      }
    });

    if (response.data.success) {
      // Update local state
      const projIndex = projects.value.findIndex(p => p.proj_id === projId);
      if (projIndex !== -1) {
        projects.value[projIndex] = {
          ...projects.value[projIndex],
          bookmark_status: isBookmarked ? 'BOOKMARKED' : 'NONE'
        };
      }
    } else {
      throw new Error(response.data.error || '북마크 상태 변경에 실패했습니다');
    }
  } catch (err) {
    console.error('Bookmark update failed:', err);
    toast.add({
      severity: 'error',
      summary: '북마크 실패',
      detail: '북마크 상태를 변경하는 중 오류가 발생했습니다.',
      life: 3000
    });
  }
};

// Initial data fetch


onMounted(() => {
  projStore.fetchProjects(user.value.userId);
});


</script>

<style scoped>
.proj-main {
  flex: 1;
}
</style>

<style scoped>
.proj-main {
  flex: 1;

}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.new-project-btn {
  width: 100%;
  padding: 0.5rem;
  text-align: left;
  color: #6b7280;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.new-project-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.new-project-input-container {
  padding: 0.25rem 0;
}

.new-project-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.new-project-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
</style>