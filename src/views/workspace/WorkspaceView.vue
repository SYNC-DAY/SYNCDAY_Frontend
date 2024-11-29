<template>
  <!-- Previous template sections remain the same until repository selector -->
  
  <!-- Repository Selector section -->
  <div class="flex items-center space-x-4">
    <!-- Login/Profile Section -->
    <div v-if="!authStore.isAuthenticated" class="flex items-center">
      <button
        @click="authStore.loginWithGithub"
        :disabled="authStore.isLoading"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Github class="h-5 w-5 mr-2 text-gray-500" />
        Connect GitHub
      </button>
    </div>

    <div v-else class="flex items-center space-x-4">
      <!-- User Profile -->
      <div class="flex items-center" v-if="authStore.username">
        <img 
          :src="authStore.avatarUrl" 
          :alt="authStore.username"
          class="h-8 w-8 rounded-full mr-2"
        >
        <span class="text-sm text-gray-700">{{ authStore.username }}</span>
      </div>

      <!-- PrimeVue Repository Selector -->
      <div class="w-72">
        <Select
          v-model="selectedRepo"
          :options="repoOptions"
          optionLabel="name"
          :loading="repoStore.isLoading"
          placeholder="Select Repository"
          class="w-full"
          :pt="{
            root: { class: 'w-full' },
            input: { class: 'flex items-center' },
            item: ({ context }) => ({
              class: [
                'flex items-center p-2',
                'hover:bg-gray-100 cursor-pointer',
                { 'bg-blue-50': context.selected }
              ]
            })
          }"
        >
          <template #value="slotProps">
            <div class="flex items-center">
              <Github class="h-5 w-5 mr-2 text-gray-500" />
              <span>{{ slotProps.value?.name || 'Select Repository' }}</span>
            </div>
          </template>
          
          <template #option="slotProps">
            <div class="flex items-center">
              <GitBranch class="h-4 w-4 mr-2 text-gray-500" />
              <span class="flex-1">{{ slotProps.option.name }}</span>
              <Check
                v-if="slotProps.option.html_url === workspaceDetails?.vcs_repo_url"
                class="h-4 w-4 text-blue-500"
              />
            </div>
          </template>
        </Select>
      </div>

      <!-- Logout Button -->
      <button
        @click="handleLogout"
        class="p-2 text-gray-400 hover:text-gray-500"
        title="Logout"
      >
        <LogOut class="h-5 w-5" />
      </button>
    </div>

    <!-- Refresh Button -->
    <button
      @click="refreshWorkspace"
      class="inline-flex items-center p-2 border border-transparent rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <RefreshCw class="h-5 w-5" :class="{ 'animate-spin': isRefreshing }" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubRepoStore } from '@/stores/github/useGithubRepoStore';
import { 
  Github, 
  RefreshCw, 
  AlertCircle, 
  Loader,
  GitBranch,
  Layout,
  Plus,
  Check,
  LogOut
} from 'lucide-vue-next';
import Select from 'primevue/select';
import CardBoardView from './views/CardBoardView.vue';

// Previous props and emits remain the same...

// Store initialization
const authStore = useGithubAuthStore();
const repoStore = useGithubRepoStore();

// State
const isLoading = ref(false);
const isRefreshing = ref(false);
const error = ref(null);
const workspaceDetails = ref(null);
const selectedRepo = ref(null);

// Computed
const repoOptions = computed(() => {
  return repoStore.allRepositories.map(repo => ({
    id: repo.id,
    name: repo.name,
    html_url: repo.html_url,
    full_name: repo.full_name,
  }));
});

// Watch for selected repository changes
watch(selectedRepo, async (newRepo) => {
  if (newRepo) {
    await handleRepoSelect(newRepo);
  }
});

// Methods
const handleRepoSelect = async (repo) => {
  try {
    const response = await fetch(`/api/workspaces/${props.workspaceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vcs_type: 'GITHUB',
        vcs_repo_url: repo.html_url
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update repository');
    }

    await fetchWorkspace();
  } catch (err) {
    error.value = 'Failed to update repository';
    console.error('Failed to update repository:', err);
  }
};

// Initialize selected repository based on workspace details
const initializeSelectedRepo = () => {
  if (workspaceDetails.value?.vcs_repo_url) {
    const currentRepo = repoOptions.value.find(
      repo => repo.html_url === workspaceDetails.value.vcs_repo_url
    );
    if (currentRepo) {
      selectedRepo.value = currentRepo;
    }
  }
};

// Update watchers
watch(workspaceDetails, initializeSelectedRepo);

// Rest of the script remains the same...

// Lifecycle hooks
onMounted(async () => {
  await initializeGitHub();
  await fetchWorkspace();
  initializeSelectedRepo();
});
</script>

<style lang="scss">
// Optional: Add custom styles for PrimeVue Select
.p-select {
  .p-select-label {
    @apply text-sm;
  }
  
  .p-select-items {
    @apply py-1;
  }

  .p-select-item {
    @apply text-sm;
  }
}
</style>