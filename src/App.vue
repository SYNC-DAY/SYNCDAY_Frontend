<template>
  <div class="app-container">
    <!-- 로그인 페이지가 아닐 때만 헤더와 메인 컨텐츠 표시 -->
    <template v-if="!isLoginPage">
      <AppHeader />
      <div class="main-container">
        <template v-if="authStore.isAuthenticated">
          <main class="content">
            <router-view />
          </main>
        </template>
      </div>
    </template>
    <!-- 로그인 페이지일 때는 router-view만 표시 -->
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './components/layout/AppHeader.vue';
import { useAuthStore } from "@/stores/auth.js";

const route = useRoute();
const authStore = useAuthStore();



// 현재 페이지가 로그인 페이지인지 확인
const isLoginPage = computed(() => route.path === '/login');
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-container {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 1rem;
  background-color: #f5f5f5;
}
</style>