<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Workspace Title -->
            <h1 class="text-2xl font-semibold text-gray-900">
              {{ workspaceDetails?.workspace_name || 'Workspace' }}
            </h1>
            <!-- Progress Badge -->
            <span v-if="workspaceDetails?.progress_status !== undefined" 
                  class="px-2.5 py-0.5 rounded-full text-sm font-medium"
                  :class="getProgressColorClass(workspaceDetails.progress_status)">
              {{ workspaceDetails.progress_status }}%
            </span>
          </div>

          <!-- Repository Selector -->
          <div class="flex items-center space-x-4">
            <div class="relative">
              <button
                @click="isRepoSelectorOpen = !isRepoSelectorOpen"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Github class="h-5 w-5 mr-2 text-gray-500" />
                {{ selectedRepoName || 'Select Repository' }}
                <ChevronDown
                  class="ml-2 h-4 w-4 text-gray-500"
                  :class="{ 'transform rotate-180': isRepoSelectorOpen }"
                />
              </button>

              <!-- Repository Dropdown -->
              <div v-if="isRepoSelectorOpen"
                   class="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div class="py-1" role="menu">
                  <div v-if="isLoading" class="px-4 py-2 text-sm text-gray-500">
                    <Loader class="animate-spin h-4 w-4 mr-2 inline" />
                    Loading repositories...
                  </div>
                  <div v-else-if="error" class="px-4 py-2 text-sm text-red-500">
                    <AlertCircle class="h-4 w-4 mr-2 inline" />
                    {{ error }}
                  </div>
                  <template v-else>
                    <button
                      v-for="repo in repositories"
                      :key="repo.id"
                      @click="selectRepository(repo)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      role="menuitem"
                    >
                      <GitBranch v-if="repo.vcs_type === 'GITHUB'" class="h-4 w-4 mr-2 text-gray-500" />
                      {{ repo.name }}
                    </button>
                  </template>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <button
              @click="refreshWorkspace"
              class="inline-flex items-center p-2 border border-transparent rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw class="h-5 w-5" :class="{ 'animate-spin': isRefreshing }" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <Loader class="h-8 w-8 animate-spin text-blue-500" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <AlertCircle class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading workspace</h3>
            <p class="mt-2 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchWorkspace"
              class="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="workspaceDetails" class="space-y-6">
        <!-- Boards Section -->
        <div v-if="workspaceDetails.cardboards?.length" class="space-y-4">
          <CardBoard
            v-for="board in workspaceDetails.cardboards"
            :key="board.cardboard_id"
            :board="board"
            @update="handleBoardUpdate"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <Layout class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No boards</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new board.</p>
          <div class="mt-6">
            <button
              @click="createNewBoard"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus class="h-5 w-5 mr-2" />
              New Board
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGithubRepoStore } from '@/stores/github/useGithubRepoStore';
import { 
  Github, 
  ChevronDown, 
  RefreshCw, 
  AlertCircle, 
  Loader,
  GitBranch,
  Layout,
  Plus 
} from 'lucide-vue-next';
import axios from 'axios';
import CardBoardView from './views/CardBoardView.vue';
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
const isLoading = ref(false);
const isRefreshing = ref(false);
const error = ref(null);
const workspaceDetails = ref(null);
const isRepoSelectorOpen = ref(false);

// Store
const repoStore = useGithubRepoStore();
const repositories = computed(() => repoStore.allRepositories);

// Selected Repository
const selectedRepoName = computed(() => {
  if (!workspaceDetails.value?.vcs_repo_url) return '';
  try {
    const url = new URL(workspaceDetails.value.vcs_repo_url);
    return url.pathname.split('/').pop();
  } catch {
    return '';
  }
});

// Methods
const getProgressColorClass = (progress) => {
  if (progress >= 80) return 'bg-green-100 text-green-800';
  if (progress >= 50) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

const fetchWorkspace = async () => {
  if (!props.workspaceId) {
    error.value = 'No workspace ID provided';
    return;
  }
  
  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`/api/workspaces/${props.workspaceId}`);
    
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

const refreshWorkspace = async () => {
  isRefreshing.value = true;
  await fetchWorkspace();
  isRefreshing.value = false;
};

const selectRepository = async (repo) => {
  try {
    await axios.patch(`/api/workspaces/${props.workspaceId}`, {
      vcs_type: 'GITHUB',
      vcs_repo_url: repo.html_url
    });
    await fetchWorkspace();
  } catch (err) {
    error.value = 'Failed to update repository';
    console.error('Failed to update repository:', err);
  } finally {
    isRepoSelectorOpen.value = false;
  }
};

const createNewBoard = async () => {
  try {
    await axios.post(`/api/workspaces/${props.workspaceId}/boards`, {
      title: 'New Board',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    await fetchWorkspace();
  } catch (err) {
    error.value = 'Failed to create board';
    console.error('Failed to create board:', err);
  }
};

const handleBoardUpdate = async () => {
  await fetchWorkspace();
};

// Lifecycle
onMounted(async () => {
  await repoStore.fetchUserRepos();
  await fetchWorkspace();
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

// Click outside to close repo selector
const handleClickOutside = (event) => {
  if (isRepoSelectorOpen.value) {
    isRepoSelectorOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>