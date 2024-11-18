<template>
  <div class="profile-page">
    <h1 class="my-page-title">MyPage</h1>
    <div class="profile-card">
      <div class="gradient-banner"></div>

      <div class="profile-content">
        <!-- 좌측 프로필 기본 정보 -->
        <div class="left-section">
          <div class="photo-section">
            <img
                :src="user.profilePhoto || '/default-avatar.png'"
                class="profile-photo"
                alt="Profile photo"
            />
          </div>
          <h2 class="username">{{ user.userName }}</h2>
          <p class="role">인사 1팀</p>
          <button @click="goToPasswordChange" class="edit-button">
            비밀번호 변경
          </button>
        </div>

        <!-- 우측 상세 정보 -->
        <div class="right-section">
          <div class="github-section">
            <div class="github-info">
              <img src="@/assets/images/github-icon.svg" alt="GitHub" class="github-icon" />
              <span class="github-id">mojeeeong</span>
            </div>
            <button class="edit-btn">계정 교체</button>
          </div>
          <div class="contact-info">회선 번호 : {{ user.phoneNumber || '031-1111-1111' }}</div>
          <div class="contact-info">Email : {{ user.email || 'momo94@threeping.co.kr' }}</div>
          <div class="contact-info">입사연도 : {{ user.joinYear || '2023' }}</div>
        </div>
        <!-- 직책 정보 -->
        <div class="role-tag">
          <div class="tag">
          <img src="@/assets/images/job.svg" alt="Role-tag" class="role-img" />
          <span class="job-title-label">직책</span>
          </div>
          <span class="job-title">Web Designer</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {useAuthStore} from "@/stores/auth.js";

const router = useRouter()
const user = ref({})
const authStore = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  try {
    // authStore.isAuthenticated가 true라면 이미 profile 데이터가 있는 상태
    if (authStore.isAuthenticated) {
      const response = await axios.get('/user/profile')
      user.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  } finally {
    loading.value = false
  }
})

const goToPasswordChange = () => {
  router.push('/password-change')
}
</script>

<style scoped>

.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 200vh;
  display: flex;          /* 추가 */
  flex-direction: column; /* 추가 */
  align-items: center;
}

.my-page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  width: 100%;          /* 추가 */
  max-width: 800px;     /* password-card와 동일한 max-width */
}

.profile-card {
  max-width: 800px;
  height: 569px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.gradient-banner {
  height: 200px;
  background: linear-gradient(to right, #FFD5B8, #FF8FB3);
}

.profile-content {
  position: relative;
  margin-top: -100px;
  display: flex;
  padding-right: 20px;
}

.left-section {
  flex: 1;
  max-width: 270px;
  text-align: center;
}

.right-section {
  max-width: 350px;
  flex: 2;
  padding-top: 8rem;
}

.photo-section {
  margin-bottom: 1rem;
}

.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 5px solid white;
  object-fit: cover;
}

.username {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.tag {
  display: flex;
  gap: 5px;
}

.role {
  color: #A7A7A7;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.edit-button {
  border: 3px solid #000;
  border-radius: 18px;
  padding: 0.5rem 1rem;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.2s;
}

.edit-button:hover {
  background: #000;
  color: white;
}

.github-section {
  border: 2px solid #D1D1D1;
  max-width: 300px;
  padding: 0.4rem 1rem;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.github-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.github-icon {
  width: 40px;
  height: 40px;
}

.github-id {
  font-size: x-large;
  font-weight: bold;
}

.edit-btn {
  padding: 0.3rem 0.8rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 0.8rem;
  cursor: pointer;
}

.contact-info {
  border: 2px solid #D1D1D1;
  font-weight: bold;
  max-width: 300px;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.role-tag {
  max-width: 165px;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  padding-top: 8rem;
}

.job-title-label {
  font-weight: 500;
  color: #666;
  margin-top: 4px;
}

.job-title {
  color: #666;
  font-size: 0.9rem;
  background: #F5F5F5;
  padding: 0.5rem 1rem;
  border-radius: 18px;
  font-weight: bold;
}
</style>