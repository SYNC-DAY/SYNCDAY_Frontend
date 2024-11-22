// WorkspaceView.vue
<template>
  <div class="workspace-container">
    <div class="workspace-header">
      <h1>Workspace</h1>
    </div>
    <div class="workspace-content">
      <CardBoard :cardboards="workspaceDetails?.cardboards || []"></CardBoard>
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
  if (!props.workspaceId) return;
  
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
  ([newWorkspaceId, newProjectId]) => {
    if (newWorkspaceId && newProjectId) {
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
}

.workspace-header {
  margin-bottom: 1.5rem;
}

.workspace-content {
  flex: 1;
}
</style>
