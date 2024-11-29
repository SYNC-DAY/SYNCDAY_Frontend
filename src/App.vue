<template>
  <div class="app-container">
    <!-- Navigation은 로그인 페이지가 아니고, 인증 초기화가 완료됐을 때만 표시 -->
    <Navigation v-if="!isLoginPage && authStore.isInitialized && authStore.user" />
    <!-- 로그인 페이지일 때는 router-view만 표시 -->
    <router-view v-if="isLoginPage" />
    <!-- 그 외의 경우 -->
    <template v-else>
      <div class="main-container">
        <template v-if="authStore.isAuthenticated">
          <main class="content">
            <router-view />
            <Assistant/>
          </main>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from "@/stores/auth.js";
import { useAssistantStore } from "@/stores/assistant.js";
import { EventSourcePolyfill } from 'event-source-polyfill';
import Navigation from "@/components/Navigation.vue";
import Assistant from './components/Assistant.vue';


const route = useRoute();
const authStore = useAuthStore();
console.log("App.vue에서 찍어보는 useAuthStore.user: ", authStore.user)

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
  width: 100vw;
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  display: flex;
  /*   background-color: #f5f5f5; */
}
</style>