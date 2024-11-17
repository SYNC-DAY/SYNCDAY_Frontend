<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="photo-section">
        <div class="photo-container">
          <img
            :src="user.profilePhoto || '/default-avatar.png'"
            class="profile-photo"
            alt="Profile photo"
          />
        </div>
      </div>

      <div class="info-section">
        <div class="info-list">
          <h2 class="username">{{ user.userName }}</h2>
          <p class="info-item">이메일: {{ user.email }}</p>
          <p class="info-item">이름: {{ user.userName }}</p>
          <p class="info-item">직책: {{ user.position }}</p>
          <p class="info-item">입사년도: {{ user.joinYear }}</p>
          <p class="info-item">마지막 접속 시간: {{ user.lastAccessTime }}</p>
          <button @click="goToPasswordChange" class="edit-button">
            비밀번호 변경하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const user = ref({
  userId: '',
  userName: '',
  email: '',
  profilePhoto: '',
  position: '',
  joinYear: '',
  lastAccessTime: '',
  teamId: null
})

onMounted(async () => {
  try {
    const response = await axios.get('/user/profile')
    user.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch user data:', error)
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
  background-color: #f8f9fa;
  min-height: 100vh;
}

.profile-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  padding: 2rem;
  margin-top: 2rem;
}

.photo-section {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.profile-photo {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.username {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.info-item {
  font-size: 1.1rem;
  color: #666;
}

.edit-button {
  margin-top: 2rem;
  padding: 0.75rem 2rem;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #333;
}
</style>