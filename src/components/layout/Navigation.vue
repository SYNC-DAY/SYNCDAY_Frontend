<template>
	<nav class="nav-top">

		<!-- logo -->
		<div class="nav-logo">
			<RouterLink to="/">
				<span>SyncDay</span>
			</RouterLink>
		</div>

		<!-- tabs -->
		<div class="nav-tabs">
			<ul>
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

		<!-- search -->
		<div class="nav-search">
			<input type="search" placeholder="검색어를 입력하세요">
		</div>

		<!-- icon,profile -->
		<div class="nav-right">
			<!-- icons -->
			<div class="icons">
				<RouterLink to="/meetingroom">
					<img src="@/assets/images/meetingroom.svg" alt="회의실 예약" class="icon-img" />
				</RouterLink>
				<RouterLink to="chat">
					<img src="@/assets/images/dm.svg" alt="채팅" class="icon-img" />
				</RouterLink>
				<RouterLink to="alarm">
					<img src="@/assets/images/alarm.svg" alt="알림" class="icon-img" />
				</RouterLink>
			</div>

			<!-- profile -->
			<div class="profile" @click="toggleDropdown" ref="profileRef">
				<div class="profile-image-container">
					<RouterLink to="/mypage">
						<img :src="user.profilePhoto || '/default-avatar.png'" alt="User Profile"
							class="profile-image" />
					</RouterLink>
				</div>
				<div class="user-menu">
					<span class="user-name">{{ user.userName }}님 ▼</span>
					<!-- 드롭다운 메뉴 -->
					<div v-show="isDropdownOpen" class="dropdown-menu">
						<RouterLink to="/mypage" class="dropdown-item">마이페이지</RouterLink>
						<button @click="handleLogout" class="dropdown-item">로그아웃</button>
					</div>
				</div>
			</div>

		</div>
	</nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from "axios";

const router = useRouter();
const authStore = useAuthStore();
const isDropdownOpen = ref(false);
const profileRef = ref(null);
const user = ref({})

console.log("authStore.user.user: ", authStore.user);
onMounted(async () => {
  try {
    // authStore.isAuthenticated가 true라면 이미 profile 데이터가 있는 상태
    if (authStore.isAuthenticated) {
      user.value = authStore
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  }
})
// 드롭다운 토글
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// 드롭다운 외부 클릭 시 닫기
const handleClickOutside = (event) => {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

// 로그아웃 처리
const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>


<style scoped>
.nav-top {
	width: 100%;
	height: 8rem;
	background-color: white;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.nav-top > 
div,
.nav-top 
ul,
.icons {
	height: 100%;
	background-color: white;
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	align-items: center;
}

.nav-top ul{
	width: 100%;
}

.nav-logo {
	flex: 2;
	font-weight: 700;
}
.nav-logo span{
	font-size: 3rem;
}
.nav-tabs{
	flex: 3;
}
.nav-top a{
	text-decoration: none;
	font-size: 1.5rem;
}
.nav-search{
	flex: 2;
  	padding: 1rem;
}

input[type=search]{
	width: 100%;
	height: 3rem;
	font-size: 1.5rem;
	border-radius: 4rem;
  	padding-left: 0.5rem;
}

.nav-right{
	flex: 3;
	display: flex;
	flex-direction: row;
}

.icons{
	flex: 1;

}
.icons img{
	height: 2rem;
}

.profile{
	flex: 1;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.profile-image-container {
	width: 4rem;
	height: 4rem;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.profile-image {

  object-fit: cover;
}

.user-name {
  font-size: 1rem;
  text-align: center;
  color: black;
}

</style>