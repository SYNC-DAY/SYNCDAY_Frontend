<template>
  <SideBar>
    <template v-for="proj in projects" :key="proj.proj_id">
      <ProjItem :title="proj.proj_name" :isActive="activeProject === proj.proj_id"
        :initialBookmarked="proj.bookmark_status === 'BOOKMARKED'" :progress="proj.progress_status"
        :isExpanded="expandedProjects.includes(proj.proj_id)" @toggle-expansion="toggleProjectExpansion(proj.proj_id)"
        @select="selectProject(proj.proj_id)" @bookmark-changed="handleBookmarkChange(proj.proj_id, $event)">
        <template v-for="workspace in proj.workspaces" :key="workspace.workspace_id">
          <WorkspaceItem :workspaceId="workspace.workspace_id" :projectId="proj.proj_id"
            :title="workspace.workspace_name" :isActive="activeWorkspace === workspace.workspace_id"
            :progress="workspace.progress_status" :initialBookmarked="workspace.bookmark_status === 'BOOKMARKED'"
            @select="selectWorkspace" @bookmark-changed="handleWorkspaceBookmark(workspace.workspace_id, $event)" />
        </template>
      </ProjItem>
    </template>

    <!-- Add New Project Section -->
    <div class="new-project-section">

      <!-- <button class="new-project-btn" @click="showNewProjectInput = true" v-if="!showNewProjectInput">
        + New Project
      </button> -->
      <div v-if="showNewProjectInput" class="new-project-input-container">
        <input v-model="newProjectName" @keyup.enter="createProject" @keyup.esc="cancelNewProject"
          placeholder="Enter project name..." ref="newProjectInput" class="new-project-input" />
      </div>
    </div>
  </SideBar>

  <div class="proj-main">
    <router-view :projects="projects" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, provide } from 'vue';
import { useAuthStore } from "@/stores/auth.js";
import { storeToRefs } from "pinia";
import { useRouter } from 'vue-router';
import axios from 'axios';

import SideBar from '@/components/SideBar.vue';
import ProjItem from './sidebar/ProjItem.vue';
import WorkspaceItem from './sidebar/WorkspaceItem.vue';

const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// State
const projects = ref([]);
const workspaces = ref([]);
provide('projects', projects);
provide('workspaces', workspaces);

const activeWorkspace = ref(null);
const activeProject = ref(null);
const expandedProjects = ref([]);
const isLoading = ref(false);
const error = ref(null);

// New state for project creation
const showNewProjectInput = ref(false);
const newProjectName = ref('');
const newProjectInput = ref(null);

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
    // Determine the HTTP method based on whether we're adding or removing the bookmark
    const response = await axios({
      method: isBookmarked ? 'POST' : 'DELETE',
      url: '/proj-members/bookmark',
      params: {
        userId: user.value.userId,
        projId: projId
      }
    });

    if (response.data.success) {
      // Update the local project state to reflect the new bookmark status
      const projIndex = projects.value.findIndex(p => p.proj_id === projId);
      if (projIndex !== -1) {
        projects.value[projIndex] = {
          ...projects.value[projIndex],
          bookmark_status: isBookmarked ? 'BOOKMARKED' : 'NONE'
        };
      }
    } else {
      throw new Error(response.data.error || 'Failed to update bookmark status');
    }
  } catch (err) {
    console.error('Failed to update bookmark status:', err);
    // You might want to add error handling UI feedback here
    // Revert the bookmark state in the UI since the operation failed
    const projIndex = projects.value.findIndex(p => p.proj_id === projId);
    if (projIndex !== -1) {
      projects.value[projIndex] = {
        ...projects.value[projIndex],
        bookmark_status: isBookmarked ? 'NONE' : 'BOOKMARKED'
      };
    }
  }
};

const handleWorkspaceBookmark = async (workspaceId, isBookmarked) => {
  try {
    await axios.put(`/workspaces/${workspaceId}/bookmark`, {
      bookmark_status: isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
    });

    // Update workspace in both workspaces ref and projects ref
    const wsIndex = workspaces.value.findIndex(w => w.workspace_id === workspaceId);
    if (wsIndex !== -1) {
      workspaces.value[wsIndex] = {
        ...workspaces.value[wsIndex],
        bookmark_status: isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
      };
    }

    projects.value = projects.value.map(proj => ({
      ...proj,
      workspaces: proj.workspaces.map(ws =>
        ws.workspace_id === workspaceId
          ? { ...ws, bookmark_status: isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED' }
          : ws
      )
    }));
  } catch (err) {
    console.error('Failed to update workspace bookmark:', err);
  }
};

const updateWorkspaces = (projectWorkspaces) => {
  if (Array.isArray(projectWorkspaces)) {
    // Update workspaces ref with the new workspace data
    const updatedWorkspaces = [...workspaces.value];
    projectWorkspaces.forEach(ws => {
      const index = updatedWorkspaces.findIndex(w => w.workspace_id === ws.workspace_id);
      if (index !== -1) {
        updatedWorkspaces[index] = { ...ws };
      } else {
        updatedWorkspaces.push({ ...ws });
      }
    });
    workspaces.value = updatedWorkspaces;
  }
};

const fetchProjs = async () => {
  try {
    const response = await axios.get(`/proj-members/users/${user.value.userId}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch Projects');
    }

    // Extract user's project member info from the response
    const userProjMembers = response.data.data[0]?.proj_member_infos || [];

    // Transform the data structure to match the component's needs
    projects.value = userProjMembers.map(proj => ({
      proj_id: proj.proj_id,
      proj_name: proj.proj_name,
      bookmark_status: proj.bookmark_status,
      participation_status: proj.participation_status,
      progress_status: proj.progress_status,
      start_time: proj.start_time,
      end_time: proj.end_time,
      created_at: proj.created_at,
      vcs_type: proj.vcs_type,
      vcs_proj_url: proj.vcs_proj_url,
      workspaces: proj.workspaces.map(ws => ({
        workspace_id: ws.workspace_id,
        workspace_name: ws.workspace_name,
        created_at: ws.created_at,
        progress_status: ws.progress_status,
        vcs_type: ws.vcs_type,
        vcs_repo_url: ws.vcs_repo_url,
        proj_id: ws.proj_id
      }))
    }));

    // Update workspaces ref with flattened workspace data
    workspaces.value = userProjMembers.flatMap(proj =>
      proj.workspaces.map(ws => ({
        ...ws,
        project_id: proj.proj_id
      }))
    );

  } catch (err) {
    console.error('Failed to fetch projects:', err);
    error.value = 'Failed to load projects';
    projects.value = [];
    workspaces.value = [];
  }
};
const createProject = async () => {
  if (!newProjectName.value.trim()) {
    return;
  }

  try {
    const response = await axios.post('/projs', {
      proj_name: newProjectName.value.trim(),
      user_id: user.value.userId
    });

    if (response.data.success) {
      const newProject = {
        proj_id: response.data.data.proj_id,
        proj_name: response.data.data.proj_name,
        bookmark_status: 'UNBOOKMARKED',
        progress_status: 'NOT_STARTED',
        workspaces: [],
        ...response.data.data
      };

      projects.value = [...projects.value, newProject];
      newProjectName.value = '';
      showNewProjectInput.value = false;
      expandedProjects.value.push(newProject.proj_id);
      await selectProject(newProject.proj_id);
    } else {
      throw new Error(response.data.error || 'Failed to create project');
    }
  } catch (err) {
    console.error('Failed to create project:', err);
    error.value = 'Failed to create project';
  }
};

const createWorkspace = async (projectId, workspaceName) => {
  try {
    const response = await axios.post('/workspaces', {
      workspace_name: workspaceName.trim(),
      proj_id: projectId
    });

    if (response.data.success) {
      const newWorkspace = {
        workspace_id: response.data.data.workspace_id,
        workspace_name: response.data.data.workspace_name,
        project_id: projectId,
        progress_status: 0,
        bookmark_status: 'UNBOOKMARKED',
        ...response.data.data
      };

      // Update workspaces ref
      workspaces.value = [...workspaces.value, newWorkspace];

      // Update projects ref
      const projectIndex = projects.value.findIndex(p => p.proj_id === projectId);
      if (projectIndex !== -1) {
        projects.value[projectIndex] = {
          ...projects.value[projectIndex],
          workspaces: [...projects.value[projectIndex].workspaces, newWorkspace]
        };
      }

      return newWorkspace;
    }
    throw new Error(response.data.error || 'Failed to create workspace');
  } catch (err) {
    console.error('Failed to create workspace:', err);
    throw err;
  }
};

const cancelNewProject = () => {
  showNewProjectInput.value = false;
  newProjectName.value = '';
};

watch(showNewProjectInput, async (newVal) => {
  if (newVal) {
    await nextTick();
    newProjectInput.value?.focus();
  }
});

onMounted(() => {
  fetchProjs();
});
</script>


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