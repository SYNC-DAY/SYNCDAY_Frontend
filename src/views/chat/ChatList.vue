<template>
  <div>
    <div v-if="isVisible" class="popup" :draggable="true">
      <button class="close-button" @click="closePopup">X</button>
      <div class="popup-content">
        <p>채팅</p>
        <div class="newchat">
          <button class="new-chat" @click="openNewChatModal">새 채팅</button>
        </div>
        <div class="chatlist">
          <ul v-if="chatRooms.length > 0">
            <li v-for="room in chatRooms"
                :key="room.roomId"
                @click="openChatRoom(room.roomId)"
                class="chat-room"
            >
              <h4>{{ room.chatRoomName }}</h4>
              <p>{{ room.lastMessage }}</p>
            </li>
          </ul>
          <div v-else-if="chatRooms === '텅'" class="no-chat-rooms">
            <p>생성된 채팅방이 없습니다. 새 채팅방을 생성해주세요.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 새 채팅방 생성 모달 -->
    <div v-if="isNewChatModalVisible" class="modal">
      <div class="modal-content">
        <h3>새 채팅방 생성</h3>
        <input type="text" v-model="newChatRoomName" placeholder="채팅방 이름" />
        <button @click="createNewChatRoom">생성</button>
        <button @click="closeNewChatModal">취소</button>
      </div>
    </div>

    <!-- 채팅방 컴포넌트 -->
    <ChatRoom
        v-if="selectedRoomId"
        :roomId="selectedRoomId"
        @close="selectedRoomId = null"
    />
  </div>
</template>

<script setup>
  defineProps({
    isVisible: {
      type: Boolean,
      required: true
    }
  });
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ChatService } from '@/plugins/chatService.js';
import ChatRoom from './ChatRoom.vue';
import axios from "axios";
const authStore = useAuthStore();
const chatService = new ChatService();
const isNewChatModalVisible = ref(false);
const chatRooms = ref([]);
const selectedRoomId = ref(null);
const newChatRoomName = ref('');

const emit = defineEmits(['update:isVisible']);

// 채팅방 목록 조회
const fetchChatRooms = async () => {
  try {
    const response = await axios.get('/chat/rooms', {
      params: { userId: authStore.user.userId }
    });
    chatRooms.value = response.data.data;
    console.log("chatRooms", chatRooms.value);
  } catch (error) {
    console.error('채팅방 목록 조회 실패:', error);
  }
};

const openChatRoom = (roomId) => {
  selectedRoomId.value = roomId;
};

const openNewChatModal = () => {
  isNewChatModalVisible.value = true;
};

const createNewChatRoom = async () => {
  try {
    const response = await axios.post('/chat/room/create', {
      chatRoomName: newChatRoomName.value,
      creatorId: authStore.user.userId,
    });
    chatRooms.value.push(response.data.data);
    newChatRoomName.value = '';
    isNewChatModalVisible.value = false;
  } catch (error) {
    console.error('새 채팅방 생성 실패:', error);
  }
};

const closeNewChatModal = () => {
  isNewChatModalVisible.value = false;
};

const closePopup = () => {
  emit('update:isVisible', false);
};

onMounted(async () => {
  await fetchChatRooms();
  await chatService.connect();
});

onUnmounted(() => {
  chatService.disconnect();
});
</script>


<style scoped>
.popup {
  position: absolute;
  top: 50px; /* 아이콘 아래로 50px */
  right: 0%;
  transform: translateX(-50%);
  width: 30%;
  height: 70%;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

/* 팝업 콘텐츠 */
.popup-content {
  padding: 20px;
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
}

.popup-content p {
  font-size: 4rem;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
}

.close-button:hover {
  color: #000000;
}

.new-chat {
  color: #FF9D85;
}

.chatlist {
  margin-top: 20px;
}

.chat-room {
  border-bottom: 1px solid #ddd;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-room:hover {
  background-color: #f5f5f5;
}

.chat-room h4 {
  margin: 0;
  font-size: 16px;
}

.chat-room p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
}
</style>