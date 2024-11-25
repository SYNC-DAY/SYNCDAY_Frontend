<!-- App.vue -->
<template>
  <div class="app-container">
    <!-- Navigation은 로그인 페이지가 아니고, 인증 초기화가 완료됐을 때만 표시 -->
    <Navigation v-if="!isLoginPage && authStore.isInitialized && authStore.user" />
    
    <!-- VCS Modal at App level -->
    <VCSConnectModal 
      v-if="showVCSModal" 
      :isOpen="showVCSModal"
      :projectId="currentProjectId"
      @close="closeVCSModal"
      @update:project="handleProjectUpdate"
    />

    <!-- OAuth Callback Handler -->
    <div v-if="isHandlingCallback" class="callback-overlay">
      Connecting to GitHub...
    </div>

    <!-- 로그인 페이지일 때는 router-view만 표시 -->
    <router-view v-if="isLoginPage" />
    <!-- 그 외의 경우 -->
    <template v-else>
      <div class="main-container">
        <template v-if="authStore.isAuthenticated">
          <main class="content">
            <router-view />
          </main>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from "@/stores/auth.js";
import { useGithubAuthStore } from "@/stores/github/useGithubAuthStore";
import Navigation from "@/components/layout/Navigation.vue";
import VCSConnectModal from './views/Proj/components/VCSConnectModal.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const githubStore = useGithubAuthStore();

// State
const showVCSModal = ref(false);
const currentProjectId = ref(null);
const isHandlingCallback = ref(false);

// Computed
const isLoginPage = computed(() => route.path === '/login');
const isGithubCallback = computed(() => {
  const currentPath = route.fullPath;
  return currentPath.includes('/oauth/github/callback');
});
// Watch for GitHub callback
watch(isGithubCallback, async (isCallback) => {
  if (isCallback) {
    await handleOAuthCallback();
  }
});

// Methods for OAuth
const handleOAuthCallback = async () => {
  const code = new URLSearchParams(window.location.search).get('code');
  const state = new URLSearchParams(window.location.search).get('state');
  console.log(code)
  if (!code) {
    console.error('No code received from GitHub');
    router.push('/project');
    return;
  }

  isHandlingCallback.value = true;

  try {
    await githubStore.handleAuthCallback(code);
    
    // Get return path from state or default to /project
    let returnPath = '/project';
    if (state) {
      returnPath = localStorage.getItem('github_return_path') || '/project';

    }
    else {
      returnPath = '/project';

    }

    router.push(returnPath);
  } catch (error) {
    console.error('GitHub callback error:', error);
    router.push('/project');
  } finally {
    isHandlingCallback.value = false;
  }
};

// Methods for VCS Modal
const openVCSModal = (projectId) => {
  currentProjectId.value = projectId;
  showVCSModal.value = true;
};

const closeVCSModal = () => {
  showVCSModal.value = false;
  currentProjectId.value = null;
};

const handleProjectUpdate = (updatedProject) => {
  // Emit event or update state as needed
  console.log('Project updated:', updatedProject);
};

// Check for callback on mount
onMounted(() => {
  if (isGithubCallback.value) {
    handleOAuthCallback();
  }
});

// Expose methods to other components
defineExpose({
  openVCSModal
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-container {
  width: 100vw;
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 1rem;
  display: flex;
}

.callback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  z-index: 1000;
}
</style>