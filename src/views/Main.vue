<template>
    <div>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold mb-4">Welcome to SyncDay</h1>
        <p>성공적으로 로그인되었습니다!</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  
  const authStore = useAuthStore()
  const router = useRouter()
  
  onMounted(async () => {
    // 페이지 로드 시 인증 상태 확인
    if (!authStore.isAuthenticated) {
      router.push('/login')
    }
  })
  </script>