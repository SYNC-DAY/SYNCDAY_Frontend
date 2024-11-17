<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md">
      <!-- 로고 및 타이틀 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">SyncDay</h1>
        <p class="text-gray-600">서비스를 이용하기 위해 로그인해주세요.</p>
      </div>

      <!-- 로그인 폼 -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- 이메일 입력 -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
              id="email"
              type="email"
              v-model="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@company.com"
          />
        </div>

        <!-- 비밀번호 입력 -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
              id="password"
              type="password"
              v-model="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
          />
        </div>

        <!-- 옵션 영역 (비밀번호 찾기 등) -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
                id="remember-me"
                type="checkbox"
                class="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-700">
              로그인 상태 유지
            </label>
          </div>
          <div class="text-sm">
            <a href="#" class="text-blue-500 hover:text-blue-600">
              비밀번호 찾기
            </a>
          </div>
        </div>

        <!-- 로그인 버튼 -->
        <div>
          <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            로그인
          </button>
        </div>

        <!-- 회원가입 링크 -->
        <div class="text-center text-sm">
          <span class="text-gray-600">계정이 없으신가요?</span>
          <router-link
              to="/signup"
              class="ml-1 text-blue-500 hover:text-blue-600 font-medium"
          >
            회원가입
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>

<style scoped>
/* 추가적인 스타일이 필요한 경우 여기에 작성 */
.min-h-screen {
  min-height: 100vh;
}
</style>