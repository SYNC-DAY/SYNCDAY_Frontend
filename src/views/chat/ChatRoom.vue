<template>
  <div class="chat-room-container">
    <div class="chat-header">
      <h3>{{ roomInfo.chatRoomName }}</h3>
      <button @click="$emit('close')">닫기</button>
    </div>

    <div class="messages-container">
      <div v-for="message in messages"
           :key="message.messageId"
           :class="['message', message.senderId === authStore.user.userId ? 'mine' : 'other']"
      >
        <span class="sender">{{ message.senderName }}</span>
        <p class="content">{{ message.message }}</p>
        <span class="time">{{ formatTime(message.sentTime) }}</span>
      </div>
    </div>

    <div class="input-container">
      <input v-model="newMessage"
             @keyup.enter="sendMessage"
             placeholder="메시지를 입력하세요"
      />
      <button @click="sendMessage">전송</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ChatService } from '@/plugins/chatService.js';
import axios from "axios";

const props = defineProps({
  roomId: {
    type: String,
    required: true
  }
});

const authStore = useAuthStore();
const chatService = new ChatService();
const messages = ref([]);
const newMessage = ref('');
const roomInfo = ref({});

const formatTime = (time) => {
  return new Date(time).toLocaleTimeString();
};

// 채팅방 정보 조회
const fetchRoomInfo = async () => {
  try {
    const response = await axios.get(`/chat/room/${props.roomId}`, {
      params: { userId: authStore.user.userId }
    });
    roomInfo.value = response.data.data;
    messages.value = roomInfo.value.messages || [];
  } catch (error) {
    console.error('채팅방 정보 조회 실패:', error);
  }
};

const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  chatService.sendMessage(props.roomId, {
    roomId: props.roomId,
    message: newMessage.value,
    senderId: authStore.user.userId,
    senderName: authStore.user.userName
  });

  newMessage.value = '';
};

onMounted(async () => {
  await fetchRoomInfo();
  await chatService.connect();

  // 메시지 구독
  chatService.subscribeToRoom(props.roomId, (message) => {
    messages.value.push(message);
  });
});

onUnmounted(() => {
  chatService.unsubscribeFromRoom(props.roomId);
});
</script>