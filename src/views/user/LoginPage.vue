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
            <!-- <a href="#" @click.prevent="alert('준비 중인 기능입니다.')">비밀번호 찾기</a> -->
          </div>
          <!-- <button type="submit" class="login-button">로그인</button> -->
          <Button label="로그인" class="login-button" type="submit" />
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
    console.log("로그인 시도 시작")
    const success = await authStore.login(email.value, password.value)
    console.log("로그인 결과:", success)
    console.log("현재 인증 상태:", authStore.isAuthenticated)
    if (success) {
      const redirectPath = route.query.redirect || '/'
      console.log("리다이렉트 시도:", redirectPath)

      try {
        await router.push(redirectPath)
        console.log("리다이렉트 성공")
      } catch (e) {
        console.error("라우터 이동 실패:", e)
      }
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>

<style scoped>
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
  /* padding: 5rem 5rem 5rem 5rem; */
  padding: 5rem;
  background-color: white;
}

.login-welcome h1 {
  font-size: 2.3rem;
  /* font-size: 2rem; */
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  line-height: 1.4;
}

.logo {
  max-width: 300px;
  /* margin-top: -40px; */
}

.login-form-container {
  flex: 1;
  /* padding:  5rem 0 5rem; */
  padding: 5rem;
  border-left: 1px solid #eee;
  text-align: center;
  /* margin-top: 5rem; */
}

.login-form-container h2 {
  /* font-size: 2rem; */
  font-size: 2.3rem;
  font-weight: bold;
  color: #333;
  /* margin-right: 23rem; */
  margin-bottom: 3rem;
}

.form-group {
  text-align: left; /* 내부 요소들을 왼쪽 정렬 */
  width: 80%; /* 컨테이너 너비 설정 */
  margin: 0 auto 1rem auto; /* 상하 마진으로 간격 조정, 좌우는 자동으로 중앙 정렬 */
}

.form-group label {
  display: block; /* inline-block에서 block으로 변경 */
  margin-bottom: 0.5rem;
  font-size: large;
  color: #333;
  font-weight: 500;
  text-align: left;
}

.form-group input {
  width: 100%; /* 부모 요소인 form-group의 너비를 기준으로 100% */
  padding: 0.5rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.login-button {
  width: 80%;
  padding: 1rem;
  /* background-color: #1a237e; */
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1.5rem;
  font-weight: 500;
  cursor: pointer;
}

/* .login-button:hover {
  background-color: #0d1b60;
} */

.forgot-password {
  width: 80%;
  margin: 0 auto;
  padding: 0 0 1rem 0;
  text-align: right;
}

.forgot-password a {
  color: #666;
  text-decoration: none;
  font-size: 1rem;
}

.forgot-password a:hover {
  color: #333;
}
</style>