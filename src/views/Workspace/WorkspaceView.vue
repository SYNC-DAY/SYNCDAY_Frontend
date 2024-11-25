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

          <!-- Repository Integration -->
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

              <!-- Repository Selector -->
              <div class="relative">
                <button
                  @click="isRepoSelectorOpen = !isRepoSelectorOpen"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Github class="h-5 w-5 mr-2 text-gray-500" />
                  {{ currentRepoName }}
                  <ChevronDown
                    class="ml-2 h-4 w-4 text-gray-500"
                    :class="{ 'transform rotate-180': isRepoSelectorOpen }"
                  />
                </button>

                <!-- Repository Dropdown -->
                <div v-if="isRepoSelectorOpen"
                     class="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div class="py-1" role="menu">
                    <div v-if="repoStore.isLoading" class="px-4 py-2 text-sm text-gray-500">
                      <Loader class="animate-spin h-4 w-4 mr-2 inline" />
                      Loading repositories...
                    </div>
                    <div v-else-if="repoStore.hasError" class="px-4 py-2 text-sm text-red-500">
                      <AlertCircle class="h-4 w-4 mr-2 inline" />
                      {{ repoStore.error }}
                    </div>
                    <template v-else>
                      <button
                        v-for="repo in repoStore.allRepositories"
                        :key="repo.id"
                        @click="handleRepoSelect(repo)"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        role="menuitem"
                      >
                        <GitBranch class="h-4 w-4 mr-2 text-gray-500" />
                        <span class="flex-1 truncate">{{ repo.name }}</span>
                        <Check
                          v-if="repo.html_url === workspaceDetails?.vcs_repo_url"
                          class="h-4 w-4 text-blue-500"
                        />
                      </button>
                    </template>
                  </div>
                </div>
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
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <!-- ... rest of the template remains the same ... -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubRepoStore } from '@/stores/github/useGithubRepoStore';
import { 
  Github, 
  ChevronDown, 
  RefreshCw, 
  AlertCircle, 
  Loader,
  GitBranch,
  Layout,
  Plus,
  Check,
  LogOut
} from 'lucide-vue-next';
import CardBoardView from './views/CardBoardView.vue';

// Props and emits remain the same...

// Store initialization
const authStore = useGithubAuthStore();
const repoStore = useGithubRepoStore();

// State
const isLoading = ref(false);
const isRefreshing = ref(false);
const error = ref(null);
const workspaceDetails = ref(null);
const isRepoSelectorOpen = ref(false);

// Computed
const currentRepoName = computed(() => {
  if (!workspaceDetails.value?.vcs_repo_url) return 'Select Repository';
  try {
    const url = new URL(workspaceDetails.value.vcs_repo_url);
    return url.pathname.split('/').pop();
  } catch {
    return 'Select Repository';
  }
});

// Methods
const handleLogout = async () => {
  authStore.logout();
  repoStore.clearRepositories();
  isRepoSelectorOpen.value = false;
  // Optionally clear workspace VCS info
  if (workspaceDetails.value) {
    try {
      await fetch(`/api/workspaces/${props.workspaceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vcs_type: null,
          vcs_repo_url: null
        })
      });
      await fetchWorkspace();
    } catch (err) {
      console.error('Failed to clear workspace VCS info:', err);
    }
  }
};

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
  } finally {
    isRepoSelectorOpen.value = false;
  }
};

// Initialize app
const initializeGitHub = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    try {
      await authStore.handleAuthCallback(code);
      await authStore.fetchUserInfo();
      await repoStore.fetchUserRepos();
    } catch (error) {
      console.error('GitHub initialization error:', error);
    }
  } else if (authStore.getAccessToken) {
    try {
      await authStore.fetchUserInfo();
      await repoStore.fetchUserRepos();
    } catch (error) {
      console.error('Failed to initialize existing session:', error);
    }
  }
};

// Lifecycle hooks
onMounted(async () => {
  await initializeGitHub();
  await fetchWorkspace();
});

// ... rest of the script remains the same ...
</script>
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>