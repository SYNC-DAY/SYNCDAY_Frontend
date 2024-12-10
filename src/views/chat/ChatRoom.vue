<!-- ChatRoom.vue v-if="shouldShowDate(index)"-->
<template>
  <div v-if="isVisible" class="popup">
    <button class="leave-chat" @click="leaveChat">채팅방 나가기</button>
    <div class="popup-content">
      <div class="a-chat">
        <button class="close-button" @click="$emit('close')"><i class="pi-angle-double-left"></i></button>
        <h2>{{ props.chatRoomName }}</h2>
      </div>
      <div class="chat-messages" ref="chatMessages">
        <template v-for="(message, index) in messages" :key="index" class="message-line">
          <div v-if="shouldShowDate(index)" class="date-divider">
            {{ formatDate(messages[index].sentTime) }}
          </div>
          <div class="message-line">
            <img :src="message.userProfileImg" alt="프로필 이미지" class="profile-img" />
            <div class="message-content">
              <span class="sender">{{ message.senderName }}</span>
              <div class="content-and-time">
                <span class="content">{{ message.content }}</span>
                <span class="time-right">{{ formatTime(message.sentTime) }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="chat-input">
        <input v-model="newMessage" type="text" placeholder="메시지를 입력하세요" @keyup.enter="sendMessage" />
        <button @click="sendMessage"><i class="pi pi-send"></i></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted, onMounted, ref, defineProps, computed, nextTick } from 'vue';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const props = defineProps({
  roomId: { type: String, required: true },
  chatRoomName: { type: String, required: true },
  removeChatFromList: { type: Function, required: true }
});

const authStore = useAuthStore();
const isVisible = ref(true);
const messagesInRoom = ref({});
const messages = computed(() => messagesInRoom.value[props.roomId] || []);
const newMessage = ref('');
const stompClient = ref(null);

// 날짜 포맷팅 함수
const formatDate = (timeString) => {
  const date = new Date(timeString);
  if (isNaN(date)) return '';
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`;
};

// 시간 포맷팅 함수
const formatTime = (timeString) => {
  const date = new Date(timeString);
  if (isNaN(date)) return '';
  const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() < 12 ? '오전' : '오후';
  return `${ampm} ${hours}:${minutes}`;
};

// 날짜 표시 여부 결정
const shouldShowDate = (index) => {
  if (index === 0) return true;
  const currentDate = formatDate(messages.value[index].sentTime);
  const previousDate = formatDate(messages.value[index - 1].sentTime);
  return currentDate !== previousDate;
};

// 메시지 가져오기
const fetchMessages = async () => {
  try {
    const response = await axios.get(`/chat/room/${props.roomId}/message`);
    messagesInRoom.value[props.roomId] = response.data;
    await nextTick(() => scrollToBottom());
  } catch (error) {
    console.error('메시지 가져오기 실패:', error);
  }
};

// 메시지 전송
const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  const chatMessage = {
    content: newMessage.value.trim(),
    roomId: props.roomId,
    senderId: authStore.user?.userId,
    senderName: authStore.user?.name,
    userProfileImg: authStore.user?.userProfileImg,
    chatType: 'TALK',
    sentTime: new Date().toISOString(),
  };

  try {
    stompClient.value.publish({
      destination: `/app/room/${props.roomId}`,
      body: JSON.stringify(chatMessage),
    });
    newMessage.value = '';
  } catch (error) {
    console.error('메시지 전송 실패:', error);
  }
};

// 스크롤 하단으로 이동
const scrollToBottom = () => {
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
};

// WebSocket 연결
const connectWebSocket = () => {
  const socket = new SockJS(`http://localhost:5000/ws?token=${authStore.accessToken}`);
  stompClient.value = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => subscribeToRoom(props.roomId),
  });
  stompClient.value.activate();
};

// 채팅방 구독
const subscribeToRoom = (roomId) => {
  stompClient.value.subscribe(`/topic/room/${roomId}`, (message) => {
    const receivedMessage = JSON.parse(message.body);
    if (!messagesInRoom.value[roomId]) messagesInRoom.value[roomId] = [];
    messagesInRoom.value[roomId].push(receivedMessage);
  });
};

onMounted(() => {
  fetchMessages();
  connectWebSocket();
});

onUnmounted(() => {
  stompClient.value.deactivate();
});
</script>

<style scoped>
.popup {
  position: absolute;
  top: 50px;
  right: 0%;
  transform: translateX(-50%);
  width: 500px;
  height: 70%;
  background-color: #d6f5ef;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
} 

  .leave-chat {
    position: absolute;
    margin-top: 0.3rem;
    margin-right: 0.5rem;
    top: 15px;
    right: 10px;
    background: none;
    border-color: #d6f5ef;
    border-style:solid;
    border-radius: 20rem;
    font-size: 0.9rem;
    cursor: pointer;
    color: #c7c5c5;
  }
  .leave-chat:hover{
    background-color: #d6f5ef;
  }

  .popup-content {
    padding: 20px;
    display: flex;
    overflow-y: auto;
    /* 내용이 길어지면 스크롤 */
    flex-direction: column;
    height: 100%;
  }

h2 {
  font-size: 1.5rem;
  color: #535353;
  margin-left: 0.5rem;
  margin-top: 0.5rem;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 10px;
  overflow-y: auto;
  padding: 1px;
  background-color: #f9fffe;
  border-radius: 5px;
  margin-bottom: 20px;
}

.chat-messages::-webkit-scrollbar {
  width: 8px; /* 세로 스크롤바 크기 */
  height: 8px; /* 가로 스크롤바 크기 */
}

/* 스크롤바의 막대 */
.chat-messages::-webkit-scrollbar-thumb {
  background-color: #bef1e8 !important; /* 색상 */
  border-radius: 50px; /* 둥근 모서리 */
}


.date-divider {
  text-align: center;
  font-size: 0.7rem;
  color: #aaaaaa;
  margin: 10px 100px;
  background-color: #d6f5ef;
  border-radius: 50px;
}

.message-line {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 0.5rem;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 0.5rem;
}

.sender {
  font-size: 12px;
}

.content-and-time {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.content {
  padding: 10px;
  border-radius: 8px;
  max-width: 400px;
  font-size: 14px;
}

.time-right {
  font-size: 0.6rem;
  color: #aaaaaa;
  margin-left: 10px;
  align-self: flex-end;
}

.time {
  font-size: 0.5rem;
}


.chat-input {
    display: flex;
    gap: 10px;
    height: 2.5rem;
    border: none;
}

.chat-input input {
  font-size: 0.9rem;
  width: 23rem;
  border-color: #c7c5c5;
  border-style: solid;
  border-radius: 5px;
}
.chat-input button {
  padding: 2px 15px ;
  background-color: #20c2a4;
  font-size: 20px;
  color: #fcfcfc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #10c2a1;
}

.close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-top: 0rem;
}

.a-chat {
  display: inline-flex;
}
</style>