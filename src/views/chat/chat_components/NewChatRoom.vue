<template>
  <div class="modal" draggable="true">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">X</button>
      <h3>새 채팅방 생성</h3>

      <div v-if="isLoading">로딩 중...</div>
      <div v-else>
      <!-- 멤버 검색 및 선택 -->
      <div class="member-selection">
        <div class="search-container">
          <label for="search">멤버 검색</label>
          <input
            id="search"
            type="text"
            v-model="searchQuery"
            placeholder="멤버 이름 검색"
            class="search-input"
          />
        </div>
        <div class="user-list">
          <!-- 스크롤 가능한 멤버 리스트 -->
          <div class="scrollable-list">
            <label
              v-for="user in filteredUsers"
              :key="user.userId"
              class="user-item"
            >
              <input
                type="checkbox"
                :value="user.userId"
                v-model="selectedMembers"
              />
              {{ user.userName }}
            </label>
          </div>
        </div>
        </div>
      </div>

      <!-- 채팅방 이름 -->
      <div class="chat-room-name">
        <label for="chatRoomName">채팅방 이름</label>
        <input
          id="chatRoomName"
          type="text"
          v-model="chatRoomName" />
      </div>

      <!-- 생성 버튼 -->
      <button class="create-new" @click="createNewChat">생성</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";

// 상태 관리
const users = ref([]); // 사용자 목록
const searchQuery = ref(""); // 검색어
const selectedMembers = ref([]); // 선택된 멤버
const chatRoomName = ref(""); // 채팅방 이름


const isLoading = ref(true);

// 사용자 목록 로드
async function loadUsers() {
  console.log("유저 목록 불러오기")
  try {
    const response = await axios.get("http://localhost:5000/api/user/select"); // API 주소 확인
    console.log("api 응답",response.data )
    users.value = response.data;
    console.log("사용자 목록: ", users.value)
  } catch (error) {
    console.error("사용자 불러오기 실패:", error.response || error.message);
  } finally {
    isLoading.value = false;
  }
}

// 검색 필터
const filteredUsers = computed(() => {
  if (Array.isArray(users.value)) {
    return users.value.filter(user =>
      user.userName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  } else {
    return [];
  }
});

// 새 채팅방 생성
async function createNewChat() {
  try {
    const response = await axios.post("/api/chat/room/create", {
      chatRoomName: chatRoomName.value,
      memberIds: selectedMembers.value,
    });
    console.log("새 채팅방 생성 성공:", response.data);
    $emit("close");
  } catch (error) {
    console.error("채팅방 생성 실패:", error);
  }
}

// 멤버 선택 시 채팅방 이름 업데이트
watch(selectedMembers, (newMembers) => {
  const memberNames = users.value
    .filter((user) => newMembers.includes(user.userId))
    .map((user) => user.userName);
  chatRoomName.value = memberNames.join(", ") || "새 채팅방";
});

// 초기 사용자 로드
loadUsers();
</script>

<style scoped>
/* 모달 전체 스타일 */
.modal {
  position: absolute;
  top: 40%;
  left: 85%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-height: 500px;
  z-index: 2000;
  overflow: hidden;
}

/* 닫기 버튼 */
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #888;
}
.close-button:hover {
  color: #555;
}

/* 멤버 선택 스타일 */
.member-selection {
  width: 100%;
  margin-bottom: 20px;
}
.search-container {
  margin-bottom: 10px;
}
.search-input {
  width: 100%;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 멤버 리스트 스크롤 */
.user-list .scrollable-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
}
.user-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.user-item input {
  margin-right: 10px;
}

/* 채팅방 이름 */
.chat-room-name {
  margin-bottom: 20px;
}
.chat-room-name input {
  width: 100%;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 생성 버튼 */
.create-new {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.create-new:hover {
  background-color: #0056b3;
}
</style>
