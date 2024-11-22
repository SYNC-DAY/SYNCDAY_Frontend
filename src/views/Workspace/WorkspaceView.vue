// WorkspaceView.vue
<template>
  <div class="workspace-container">
    <div v-if="isLoading" class="loading-state">
      Loading...
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchWorkspace" class="retry-button">
        Retry
      </button>
    </div>

    <template v-else-if="workspaceDetails">
      <div class="workspace-header">
        <h1>{{ workspaceDetails.workspace_name }}</h1>
      </div>
      <div class="workspace-content">
        <CardBoard 
          :cardboards="workspaceDetails.cardboards || []"
        ></CardBoard>
      </div>
    </template>

    <div v-else class="empty-state">
      No workspace data available
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import CardBoard from './views/CardBoardView.vue';

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  },
  workspaceId: {
    type: [String, Number],
    required: true
  },
  projects: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:projects']);
const isLoading = ref(false);
const error = ref(null);
const workspaceDetails = ref(null);

const fetchWorkspace = async () => {
  if (!props.workspaceId) {
    error.value = 'No workspace ID provided';
    return;
  }
  
  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`/workspaces/${props.workspaceId}`);
    
    if (response.data.success) {
      workspaceDetails.value = response.data.data;
      
      const updatedProjects = JSON.parse(JSON.stringify(props.projects));
      const project = updatedProjects.find(p => p.proj_id === parseInt(props.projectId));
      
      if (project) {
        const workspace = project.workspaces.find(
          w => w.workspace_id === parseInt(props.workspaceId)
        );
        if (workspace) {
          Object.assign(workspace, {
            workspace_name: workspaceDetails.value.workspace_name,
            progress_status: workspaceDetails.value.progress_status,
            bookmark_status: workspaceDetails.value.bookmark_status,
          });
          
          emit('update:projects', updatedProjects);
        }
      }
    } else {
      throw new Error(response.data.error || 'Failed to fetch workspace data');
    }
  } catch (err) {
    error.value = err.message || 'Failed to load workspace';
    console.error('Failed to fetch workspace:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchWorkspace();
});

watch(
  [() => props.workspaceId, () => props.projectId],
  ([newWorkspaceId, newProjectId], [oldWorkspaceId, oldProjectId]) => {
    if ((newWorkspaceId && newWorkspaceId !== oldWorkspaceId) || 
        (newProjectId && newProjectId !== oldProjectId)) {
      fetchWorkspace();
    }
  }
);
</script>

<style scoped>
.workspace-container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  min-height: 200px;
}

.workspace-header {
  margin-bottom: 1.5rem;
}

.workspace-content {
  flex: 1;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error-state {
  color: #dc3545;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #0056b3;
}

.loading-state::after {
  content: '';
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-top: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>