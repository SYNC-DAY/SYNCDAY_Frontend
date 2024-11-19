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
          <div class="forgot-password">
            <a href="#" @click.prevent="alert('준비 중인 기능입니다.')">비밀번호 찾기</a>
          </div>
          <button type="submit" class="login-button">로그인</button>
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
  padding: 15rem 5rem 0 5rem;
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
  padding: 15rem 5rem 0 5rem;
  border-left: 1px solid #eee;
}

.login-form-container h2 {
  font-size: 4rem;
  font-weight: bold;
  color: #333;
}

.form-group label {
  display: block;
  margin-bottom: 1rem;
  font-size: large;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 2rem 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 3rem;
}

.login-button {
  width: 100%;
  padding: 3rem;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 2.5rem;
  font-weight: 500;
  cursor: pointer;}

.login-button:hover {
  background-color: #0d1b60;
}

.forgot-password {
  padding: 2rem 1rem;
  text-align: right;
}

.forgot-password a {
  color: #666;
  text-decoration: none;
  font-size: 1.9rem;
}

.forgot-password a:hover {
  color: #333;
}
</style>