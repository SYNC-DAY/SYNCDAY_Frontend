<template>
  <div class="workspace-container container-column width-100">
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
      <div class="workspace-header container-row underline-gray">
        <h3>{{ workspaceDetails.workspace_name }}</h3>
      </div>

      <!-- select view mode -->
      <div>
        <Tabs value="0">
          <TabList>
            <Tab value="0">CardBoard</Tab>
            <Tab value="1">Kanban</Tab>
            <Tab value="2">RoadMap</Tab>
          </TabList>

          <TabPanels>
            <TabPanel value="0">
              <CardBoard :cardboards="workspaceDetails.cardboards || []"></CardBoard>
            </TabPanel>
            <TabPanel value="1">
              <KanbanBoard :cardboards="workspaceDetails.cardboards || []" />

            </TabPanel>
            <TabPanel value="2">
              <p class="m-0">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum
                deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non
                provident, similique sunt in culpa
                qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est
                et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo
                minus.
              </p>
            </TabPanel>
            <!-- Calendar view -->
          </TabPanels>
        </Tabs>
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

import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

import CardBoard from './views/CardBoardView.vue';
import KanbanBoard from './views/KanbanBoardView.vue';
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
  padding: 1rem;
}

.workspace-content {}

.boards-container {
  height: 100%;
  padding: 1rem;
  overflow-x: auto;
  display: flex;
  gap: 1rem;
}

/* Add custom scrollbar styling */
.boards-container::-webkit-scrollbar {
  height: 6px;
}

.boards-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.boards-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.boards-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>