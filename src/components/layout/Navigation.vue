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
					<RouterLink 
					to="/calendar" 
					class="nav-link" 
					:class="{ 'active': isRouteActive('calendar') }">
						캘린더
						<div class="underbar"></div>
					</RouterLink>
				</li>

				<li>
					<RouterLink 
					to="/team" 
					class="nav-link" 
					:class="{ 'active': isRouteActive('team') }">
						팀
						<div class="underbar"></div>
					</RouterLink>
				</li>

				<li>
					<RouterLink 
					to="/project" 
					class="nav-link" 
					:class="{ 'active': isRouteActive('project') }">
						프로젝트
						<div class="underbar"></div>
					</RouterLink>
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
				<button class="icon-button" @click="toggleChatPop">
					<img src="@/assets/images/dm.svg" alt="채팅" class="icon-img" />
				</button>
				<RouterLink to="alarm">
					<img src="@/assets/images/alarm.svg" alt="알림" class="icon-img" />
				</RouterLink>
			</div>

			<!-- profile -->
			<div class="profile" @click="toggleDropdown" ref="profileRef">
				<div class="profile-image-container">
					<RouterLink to="/mypage">
						<img :src="authStore.user.profilePhoto || '/default-avatar.png'" alt="User Profile"
							class="profile-image" />
					</RouterLink>
				</div>
				<div class="user-menu">
					<span class="user-name">{{ authStore.user.userName }}님 ▼</span>
					<!-- 드롭다운 메뉴 -->
					<div v-show="isDropdownOpen" class="dropdown-menu">
						<RouterLink to="/mypage" class="dropdown-item">마이페이지</RouterLink>
						<button @click="handleLogout" class="dropdown-item">로그아웃</button>
					</div>
				</div>
			</div>

</div>
<ChatPop :key="isPopupVisible" :isVisible="isPopupVisible" @update:isVisible="isPopupVisible = $event" />
	</nav>
</template>

<script setup>
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { ref, onMounted, onUnmounted, computed } from 'vue';

import ChatPop from '@/views/chat/ChatRoomList.vue';


const isPopupVisible = ref(false);
const router = useRouter();
const route = useRoute();
const isDropdownOpen = ref(false);
const profileRef = ref(null);
const authStore = useAuthStore();

// 현재 라우트 경로 계산
const currentRoute = computed(() => route.path);

// 드롭다운 토글
const toggleDropdown = () => {
	isDropdownOpen.value = !isDropdownOpen.value;
};

// 채팅 팝업
const toggleChatPop = () => {
  isPopupVisible.value = !isPopupVisible.value;
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
	isPopupVisible.value = false;
});

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside);
});

const isRouteActive = (routeName) => {
  // 경로에 routeName이 포함되어 있는지 확인
  return route.path.includes(`/${routeName}`);
};
</script>

<style scoped>
.nav-top {
	width: 100%;
	height: 10vh;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem;
	border-bottom: 1px solid var(--outline-gray);
}

.nav-top > div,
.nav-top ul,
.icons {
	height: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	align-items: center;
}

.nav-top ul {
	width: 100%;
}

.nav-logo {
	flex: 2;
	font-weight: 700;
}

.nav-logo span {
	font-size: 2rem;
}

.nav-tabs {
	flex: 2.5;
}

.nav-tabs ul {
	width: 100%;
	display: flex;
	justify-content: space-around;
	align-items: center;
	height: auto;
}

.nav-link {
	text-decoration: none;
	font-size: 1.2rem;
	padding: 1rem 1rem;
	position: relative;
	display: inline-block;
}

/* 언더바 스타일 */
.underbar {
	position: absolute;
	top: -0.3 rem;
	left: 0;
	width: 0;
	height: 0.8rem;
	background: linear-gradient(90deg, var(--pink-color), var(--apricot-color));
	transition: width 0.3s ease;
}

.nav-link.active .underbar {
	width:100%;
}

.nav-tabs li {
	position: relative;
	height: auto;
}

.nav-search {
	flex: 2.5;
	padding: 0.5rem;
}

input[type=search] {
	width: 15rem;
	height: 2.4rem;
	font-size: 1.2rem;
	border-radius: 1.2rem;
	padding: 0 1rem;
}

.nav-right {
	flex: 2;
	display: flex;
	flex-direction: row;
}

.icons {
	flex: 1;
}

.icons img {
	height: 1.5rem;
}

.icon-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.icon-button img {
  height: 1.5rem;
}
.profile{
	flex: 1;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
}

.profile-image-container {
	width: 4rem;
	height: 4rem;
	border-radius: 50%;
	overflow: hidden;
	margin-bottom: 0.25rem;
}

.profile-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.user-menu {
	position: relative;
}

.user-name {
	font-size: 1rem;
	text-align: center;
	color: black;
	cursor: pointer;
}

.dropdown-menu {
	position: absolute;
	top: 100%;
	right: 0;
	background: white;
	border: 1px solid var(--outline-gray);
	border-radius: 0.5rem;
	padding: 0.5rem;
	z-index: 1000;
}

.dropdown-item {
	display: block;
	padding: 0.5rem 1rem;
	text-decoration: none;
	color: black;
	white-space: nowrap;
	cursor: pointer;
	border: none;
	background: none;
	width: 100%;
	text-align: left;
	font-size: 1rem;
}

.dropdown-item:hover {
	background-color: var(--outline-gray);
}
</style>