<template>
  <nav class="navigation-bar">
    <div class="nav-left">
      <RouterLink to="/" class="logo">
        <span>SyncDay</span>
      </RouterLink>
      <ul class="nav-links">
        <li>
          <RouterLink to="/calendar">캘린더</RouterLink>
        </li>
        <li>
          <RouterLink to="/team">팀</RouterLink>
        </li>
        <li>
          <RouterLink to="/project">프로젝트</RouterLink>
        </li>
      </ul>
    </div>
    <div class="nav-right">
      <input type="search" placeholder="검색어를 입력하세요" class="search-input">
      <div class="icons">
        <RouterLink to="/meetingroom">
          <img src="@/assets/images/meetingroom.svg" alt="회의실 예약" class="icon-img" />
        </RouterLink>
        <RouterLink to="/chat">
          <img src="@/assets/images/dm.svg" alt="채팅" class="icon-img" />
        </RouterLink>
        <RouterLink to="alarm">
          <img src="@/assets/images/alarm.svg" alt="알림" class="icon-img" />
        </RouterLink>
      </div>
      <div class="user-profile">
        <div class="profile-image-container">
          <RouterLink to="/mypage">
            <img
                :src="authStore.user?.profilephoto || '/default-avatar.png'"
                alt="User Profile"
                class="profile-image"
            />
          </RouterLink>
        </div>
        <RouterLink to="/mypage">
          <span class="user-name">{{ authStore.user?.username }}님 ▼</span>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { ChatList } from '@/views/chat/ChatList.vue';

const authStore = useAuthStore();
</script>

<style scoped>
* {
  text-decoration: none;
}
.navigation-bar {
  display: flex;
  width: 96vw;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  border-bottom: 1px solid #ccc;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo {
  margin-right: 5rem; 
}

.logo span {
  font-size: 1.8rem;
  font-weight: bold;
  color: black;
}

.nav-links {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0; 
  margin-left: 1rem;
}

.nav-links li {
  margin-right: 6rem;
}

.nav-links li a {
  text-decoration: none;
  color: inherit;
}

.nav-right {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 10rem;
  width: 20vw;
  height: 5vh;
  margin-right: 8rem;
}

.icons {
  display: flex;
  align-items: center;
  margin-right: 1.5rem; 
}

.icon-img {
  width: 24px;
  height: 24px;
  margin-right: 3rem; 
}

.user-profile {
  display: flex;
  align-items: center;
  flex-direction: column; 
}

.profile-image-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 0.875rem;
  text-align: center;
  color: black;
}
</style>