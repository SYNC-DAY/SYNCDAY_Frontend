<template>
  <div class="app-container">
    <AppHeader 
      :userName="authStore.user?.userName || ''" 
      :profileImageUrl="authStore.user?.profilePhoto || 'https://via.placeholder.com/32'" 
    />
    <div class="main-container" v-if="authStore.isAuthenticated">
      <SideBar :menuItems="currentMenuItems" />
      <main class="content">
        <router-view />
      </main>
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppHeader from './components/layout/AppHeader.vue';
import SideBar from './components/layout/SideBar.vue';
import { useAuthStore } from "@/stores/auth.js";
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const userSidebars = {
  project: ['Proj 1', 'Proj 2', 'Proj 3', 'Proj 4'],
  calendar: ['Cal 1', 'Cal 2', 'Cal 3'],
}

const currentMenuItems = ref(userSidebars.project);

// 로그인 상태 체크
onMounted(async () => {
  try {
    // 저장된 토큰이 있다면 사용자 정보 가져오기
    if (authStore.accessToken) {
      await authStore.fetchUserInfo();
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    router.push('/login');
  }
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-container {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

.content {
  flex-grow: 1;
  padding: 1rem;
}
</style>