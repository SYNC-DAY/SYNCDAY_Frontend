<template>
  <div class="login-container">
    <div class="login-content">
      <!-- 왼쪽: 환영 메시지와 로고 -->
      <div class="login-welcome">
        <h1>당신의<br>일정을 편리하게<br>관리하세요</h1>
        <img src="@/assets/images/syncdaylogo.svg" alt="SyncDay Logo" class="logo">
      </div>

      <!-- 오른쪽: 로그인 폼 -->
      <div class="login-form-container">
        <h2>로그인</h2>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>이메일</label>
            <input
                type="email"
                v-model="email"
                placeholder="example@hanhwa.com"
                required
            >
          </div>

          <div class="form-group">
            <label>비밀번호</label>
            <input
                type="password"
                v-model="password"
                required
            >
          </div>

          <button type="submit" class="login-button">로그인</button>

          <div class="forgot-password">
            <a href="#" @click.prevent="alert('준비 중인 기능입니다.')">비밀번호 찾기</a>
          </div>
        </form>
      </div>
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

<<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-content {
  display: flex;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 1000px;
  height: 600px;
}

.login-welcome {
  flex: 1;
  padding: 40px;
  background-color: white;
}

.login-welcome h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  line-height: 1.4;
}

.logo {
  max-width: 300px;
  margin-top: -40px;
}

.login-form-container {
  flex: 1;
  padding: 40px;
  border-left: 1px solid #eee;
}

.login-form-container h2 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 20px;
}

.login-button:hover {
  background-color: #0d1b60;
}

.forgot-password {
  text-align: right;
  margin-top: 15px;
}

.forgot-password a {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password a:hover {
  color: #333;
}
</style>