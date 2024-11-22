// WorkspaceView.vue
<template>
  <div v-if="workspace" class="max-w-6xl mx-auto px-4">
    <!-- Error Alert -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <!-- Header -->
    <div class="mb-6 flex items-center gap-2">
      <h1 class="text-2xl font-medium">{{ workspace.workspace_name }}</h1>
      <button 
        class="text-2xl"
        :class="workspace.bookmark_status === 'BOOKMARKED' ? 'text-[#ff7eb3]' : 'text-gray-300'"
      >★</button>
    </div>

    <!-- Tabs & View Controls -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-6 border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="py-2 px-4 relative"
          :class="[
            activeTab === tab.id 
              ? 'text-black font-medium border-b-2 border-[#ff7eb3]' 
              : 'text-gray-600'
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
      <div class="flex gap-2">
        <button 
          v-for="mode in viewModes"
          :key="mode.id"
          class="px-4 py-1.5 rounded-full text-sm"
          :class="[
            viewMode === mode.id 
              ? 'bg-[#ff7eb3] text-white' 
              : 'bg-white border border-gray-200'
          ]"
          @click="viewMode = mode.id"
        >
          {{ mode.name }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-if="activeTab === 'board'" class="grid grid-cols-3 gap-6">
      <div 
        v-for="board in boards"
        :key="board.id"
        class="board bg-[#fff2f5] rounded-2xl p-4"
      >
        <h3 class="font-medium mb-4">{{ board.name }}</h3>
        <div class="space-y-2">
          <div 
            v-for="card in board.cards"
            :key="card.id"
            class="card bg-white p-3 rounded-lg border border-gray-100 cursor-pointer hover:border-[#ff7eb3] group"
          >
            <div class="flex items-center gap-2">
              <div 
                class="w-1 h-[22px] rounded-full"
                :class="card.colorClass"
              ></div>
              <span>{{ card.title }}</span>
              <div class="ml-auto w-6 h-6 rounded-full bg-gray-100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="h-full flex items-center justify-center text-gray-500">
    워크스페이스를 찾을 수 없습니다
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

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

// State
const activeTab = ref('board');
const viewMode = ref('card');
const isLoading = ref(false);
const error = ref(null);
const workspaceDetails = ref(null);

// Constants
const tabs = [
  { id: 'board', name: 'Board' },
  { id: 'kanban', name: 'Kanban' },
  { id: 'calendar', name: 'Calendar' }
];

const viewModes = [
  { id: 'card', name: 'Card' },
  { id: 'board', name: 'Board' }
];

const boards = [
  {
    id: 1,
    name: 'Board 1',
    cards: [
      { id: 1, title: 'Card 1', colorClass: 'bg-[#ff3366]' },
      { id: 2, title: 'Card 2', colorClass: 'bg-[#ff9966]' },
      { id: 3, title: 'Card 3', colorClass: 'bg-[#ffcc00]' }
    ]
  },
  {
    id: 2,
    name: 'Board 2',
    cards: [
      { id: 4, title: 'Card 4', colorClass: 'bg-[#33cc33]' },
      { id: 5, title: 'Card 5', colorClass: 'bg-[#3366ff]' }
    ]
  },
  {
    id: 3,
    name: 'Board 3',
    cards: [
      { id: 6, title: 'Card 6', colorClass: 'bg-[#ff3366]' },
      { id: 7, title: 'Card 7', colorClass: 'bg-[#ffcc00]' }
    ]
  }
];

// Computed
const workspace = computed(() => {
  const project = props.projects.find(p => p.proj_id === parseInt(props.projectId));
  if (!project) return null;
  return project.workspaces.find(w => w.workspace_id === parseInt(props.workspaceId));
});

// Methods
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

// Lifecycle
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
.card {
  transition: all 0.2s;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
