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
                :src="authStore.user.profilePhoto || '/default-avatar.png'"
                class="profile-photo"
                alt="Profile photo"
            />
          </div>
          <h2 class="username">{{ authStore.user.userName }}</h2>
          <!-- <p class="role">{{ teamResponse.teamName }}</p> -->
          <button @click="goToPasswordChange" class="edit-button">
            비밀번호 변경
          </button>
        </div>

        <!-- 우측 상세 정보 -->
        <div class="right-section">
          <div class="contact-info">회선 번호 : {{ userInfo.phoneNumber || '031-1111-1111' }}</div>
          <div class="contact-info">Email : {{ authStore.user.email || 'momo94@threeping.co.kr' }}</div>
          <div class="contact-info">입사연도 : {{ userInfo.joinYear || '2023' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
import {useAuthStore} from "@/stores/auth.js";
import {onMounted, ref} from "vue";
import axios from "axios";
const authStore = useAuthStore()
const userInfo = ref({});
const goToPasswordChange = () => {
  router.push('/password-change')
}
const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/user/profile')
    const teamResponse = await axios.get('/team/my', { params: `${userInfo.value.userId}` })
    console.log("team name: ", teamResponse)
    userInfo.value = response.data.data
  } catch (error) {
    console.log("유저정보 fetch 실패" ,error)
  }
}


onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-page {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 0rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.my-page-title {
  margin: 1rem 0;
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.profile-card {
  width: 55rem;
  background-color: var(--surface-card);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-2);
  padding: 0 0 2rem 0;
  overflow: hidden;
  box-shadow:2px 4px 8px 0 rgba(0, 0, 0, 0.2);
  height: 45rem;
}

.gradient-banner {
  height: 15rem;
  background: linear-gradient(to right, #FFD5B8, #14B8A6);
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
}

.profile-content {
  margin-top: -8rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem;
  background: var(--surface-card);
  border-radius: 1rem;
  box-shadow: var(--shadow-1);
}

.left-section {
  flex: 1;
  max-width: 20rem;
  text-align: center;
  margin: 0 auto;
}

.right-section {
  flex: 2;
  max-width: 30rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 8rem;
}

.profile-photo {
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  border: 0.5rem solid var(--surface-border);
  object-fit: cover;
  box-shadow: var(--shadow-1);
  margin-bottom: 1rem;
}

.username {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.role {
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--text-secondary-color);
  margin-bottom: 1.5rem;
}

.edit-button {
  background: var(--primary-color);
  color: var(--primary-color-text);
  border: none;
  border-radius: 2rem;
  padding: 0.7rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-button:hover {
  background: var(--primary-color-dark);
}

.contact-info {
  font-size: 1.4rem;
  color: var(--text-color-secondary);
  border-bottom: 1px solid var(--surface-border);
  padding: 0.5rem 0;
}

</style>