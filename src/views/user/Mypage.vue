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
              <button class="edit-btn">계정 교체</button>
            </div>
          </div>
          <div class="contact-info">회선 번호 : {{ userInfo.phoneNumber || '031-1111-1111' }}</div>
          <div class="contact-info">Email : {{ authStore.user.email || 'momo94@threeping.co.kr' }}</div>
          <div class="contact-info">입사연도 : {{ userInfo.joinYear || '2023' }}</div>
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
  max-width: 70rem;
  margin: 0 auto;
  padding: 0rem 2rem;
  min-height: 200vh;
  display: flex;          /* 추가 */
  flex-direction: column; /* 추가 */
  align-items: center;
}

.my-page-title {
  margin: 1rem 0;
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  width: 100%;          /* 추가 */
  max-width: 70rem;     /* password-card와 동일한 max-width */
}

.profile-card {
  max-width: 100rem;
  height: 50rem;
  width: 100%;
  background: white;
  border-radius: 3rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.gradient-banner {
  height: 17rem;
  background: linear-gradient(to right, #FFD5B8, #FF8FB3);
}

.profile-content {
  position: relative;
  margin-top: -13rem;
  display: flex;
  padding: 0 4rem;
}

.left-section {
  flex: 1;
  max-width: 20rem;
  text-align: center;
  margin-top: 7rem;
}

.right-section {
  width: 50rem;
  flex: 2;
  padding-top: 16rem;
  place-items: center;
}

.role-tag {
  max-width: 15rem;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2rem;
  padding-top: 16rem;
}

.profile-photo {
  width: 12rem;
  height: 12rem;
  border: solid #D1D1D1 0.3rem;
  border-radius: 50%;
  border: 0.7rem solid white;
  object-fit: cover;
}

.username {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 1rem;
}

.tag {
  display: flex;
  gap: 0.7rem;
}

.role {
  color: #A7A7A7;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.7rem;
}

.role-img {
  width: 2rem;
  height: 2rem;
}

.edit-button {
  border: 0.3rem solid #000;
  border-radius: 2rem;
  padding: 1rem 1.5rem;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s;
}

.edit-button:hover {
  background: #000;
  color: white;
}

.github-section {
  border: 0.2rem solid #D1D1D1;
  max-width: 50rem;
  width: 85%;
  height: 5rem;
  border-radius: 2rem;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.github-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.github-icon {
  width: 3.5rem;
  height: 3.5rem;
}

.github-id {
  font-size: x-large;
  font-weight: bold;
}

.edit-btn {
  display: flex;
  padding: 1rem 2rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 1.3rem;
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 7rem;
}

.contact-info {
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  border: 0.2rem solid #D1D1D1;
  font-weight: bold;
  max-width: 50rem;
  height: 5rem;
  width: 85%;
  border-radius: 2rem;
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.job-title-label {
  font-weight: normal;
  color: #666;
  margin-top: 0.3rem;
  font-size: 1.3rem;
}

.job-title {
  color: #666;
  font-size: 1.5rem;
  background: #F5F5F5;
  padding: 1rem 2rem;
  border-radius: 5rem;
  font-weight: bold;
}
</style>