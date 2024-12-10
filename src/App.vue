<script setup>
    import { useAuthStore } from '@/stores/auth.js';
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';
    const route = useRoute();
    const authStore = useAuthStore();

    // 현재 페이지가 로그인 페이지인지 확인
    const isLoginPage = computed(() => route.path === '/login');
</script>

<template>
    <div v-if="authStore.isAuthenticated">
        <router-view />
    </div>
</template>

<style></style>
