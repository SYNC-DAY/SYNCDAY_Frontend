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

    <!-- Add New Project Section -->
    <div class="new-project-section">
      <button 
        class="new-project-btn"
        @click="showNewProjectInput = true"
        v-if="!showNewProjectInput"
      >
        + New Project
      </button>
      <div v-if="showNewProjectInput" class="new-project-input-container">
        <input
          v-model="newProjectName"
          @keyup.enter="createProject"
          @keyup.esc="cancelNewProject"
          placeholder="Enter project name..."
          ref="newProjectInput"
          class="new-project-input"
        />
      </div>
    </div>
  </SideBar>

  <div class="proj-main">
    <router-view 
      :projects="projects"
      @update:projects="updateProjects"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
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

// Existing state
const projects = ref([]);
const activeWorkspace = ref(null);
const activeProject = ref(null);
const expandedProjects = ref([]);
const isLoading = ref(false);
const error = ref(null);

// New state for project creation
const showNewProjectInput = ref(false);
const newProjectName = ref('');
const newProjectInput = ref(null);

// New method for project creation
const createProject = async () => {
  if (!newProjectName.value.trim()) {
    return;
  }

  try {
    const response = await axios.post('/projs/', {
      proj_name: newProjectName.value.trim(),
      user_id: user.value.userId
    });

    if (response.data.success) {
      // Add the new project to the list
      projects.value.push(response.data.data);
      // Reset the input
      newProjectName.value = '';
      showNewProjectInput.value = false;
    } else {
      throw new Error(response.data.error || 'Failed to create project');
    }
  } catch (err) {
    console.error('Failed to create project:', err);
    error.value = 'Failed to create project';
  }
};

// Method to cancel project creation
const cancelNewProject = () => {
  showNewProjectInput.value = false;
  newProjectName.value = '';
};

// Watch for showNewProjectInput changes to focus the input
watch(showNewProjectInput, async (newVal) => {
  if (newVal) {
    await nextTick();
    newProjectInput.value?.focus();
  }
});

// Existing methods remain the same...
// [Previous methods remain unchanged]

</script>

<style scoped>
/* Existing styles remain the same */
.proj-main {
  height: calc(100vh - 10vh);
  flex: 1;
  padding: 1rem;
  display: inline-block;
  overflow-y: auto;
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

/* New styles for project creation */
.new-project-section {
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
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