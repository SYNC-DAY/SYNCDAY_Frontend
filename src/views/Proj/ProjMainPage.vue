
// ProjMainPage.vue
<template>
  <SideBar>
    <template v-for="proj in projects" :key="proj.proj_id">
      <ProjItem 
        :title="proj.proj_name"
        :isActive="activeProject === proj.proj_id"
        :initialBookmarked="proj.bookmark_status === 'BOOKMARKED'"
        :progress="proj.progress_status"
        :isExpanded="expandedProjects.includes(proj.proj_id)"
        @toggle-expansion="toggleProjectExpansion(proj.proj_id)"
        @select="selectProject(proj.proj_id)"
        @bookmark-changed="handleBookmarkChange(proj.proj_id, $event)"
      >
        <template v-for="workspace in proj.workspaces" :key="workspace.workspace_id">
          <WorkspaceItem 
            :workspaceId="workspace.workspace_id"
            :projectId="proj.proj_id"
            :title="workspace.workspace_name"
            :isActive="activeWorkspace === workspace.workspace_id"
            :progress="workspace.progress_status"
            :initialBookmarked="workspace.bookmark_status === 'BOOKMARKED'"
            @select="selectWorkspace"
            @bookmark-changed="handleWorkspaceBookmark(workspace.workspace_id, $event)"
          />
        </template>
      </ProjItem>
    </template>
  </SideBar>

  <div class="proj-main">
    <router-view 
      :projects="projects"
      @update:projects="updateProjects"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from "@/stores/auth.js";
import { storeToRefs } from "pinia";
import { useRouter } from 'vue-router';
import axios from 'axios';

import SideBar from '@/components/layout/SideBar.vue';
import ProjItem from './components/SideBar/ProjItem.vue';
import WorkspaceItem from './components/SideBar/WorkspaceItem.vue';

const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// State
const projects = ref([]);
const activeWorkspace = ref(null);
const activeProject = ref(null);
const expandedProjects = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Methods
const selectWorkspace = async (workspaceId, projId) => {
  isLoading.value = true;
  error.value = null;

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
    error.value = 'Navigation failed';
    console.error('Navigation failed:', err);
  } finally {
    isLoading.value = false;
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
  }
};

const toggleProjectExpansion = (projId) => {
  const index = expandedProjects.value.indexOf(projId);
  if (index === -1) {
    expandedProjects.value.push(projId);
  } else {
    expandedProjects.value.splice(index, 1);
  }
};

const handleBookmarkChange = async (projId, isBookmarked) => {
  try {
    await axios.put(`/proj-members/${projId}/bookmark`, {
      bookmark_status: isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
    });
    
    const proj = projects.value.find(p => p.proj_id === projId);
    if (proj) {
      proj.bookmark_status = isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED';
    }
  } catch (err) {
    console.error('Failed to update bookmark status:', err);
  }
};

const handleWorkspaceBookmark = async (workspaceId, isBookmarked) => {
  try {
    await axios.put(`/workspaces/${workspaceId}/bookmark`, {
      bookmark_status: isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
    });
    
    projects.value.forEach(proj => {
      const workspace = proj.workspaces.find(ws => ws.workspace_id === workspaceId);
      if (workspace) {
        workspace.bookmark_status = isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED';
      }
    });
  } catch (err) {
    console.error('Failed to update workspace bookmark:', err);
  }
};

const fetchProjs = async () => {
  try {
    const response = await axios.get(`/projs/users/${user.value.userId}`);
    if (response.data.success) {
      projects.value = response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch Projects');
    }
  } catch (err) {
    console.error('Failed to fetch projects:', err);
    error.value = 'Failed to load projects';
  }
};

const updateProjects = (newProjects) => {
  projects.value = newProjects;
};

// Lifecycle
onMounted(() => {
  fetchProjs();
});
</script>

<style scoped>
.proj-main {
  height: calc(100vh - 64px);
  flex: 1;
  padding: 2rem;
  display: inline-block;
  overflow-y: auto;
  background-color: #f9fafb;
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
</style>