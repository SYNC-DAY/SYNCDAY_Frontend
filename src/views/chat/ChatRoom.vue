<template>
  <div v-if="isVisible" class="popup">
    <button class="close-button" @click="$emit('close')">X</button>
    <button class="leave-chat" @click="leaveChat">채팅방 나가기</button>
    <div class="popup-content">
      <h2>{{ props.chatRoomName }}</h2>
      <div class="chat-messages">
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
            <span class="time-right">{{ message.sentTime }}</span>
          </div>
        </div>
      </div>
        </template>
      </div>
      <div class="chat-input">
        <input 
          v-model="newMessage"   type="text"   placeholder=" 메시지를 입력하세요"  @keyup.enter="sendMessage" />
      <button @click="sendMessage">전송</button>
    </div>
      </div>
    </div>
  

</template>

<script setup>
import { onUnmounted, onMounted, ref, defineProps, computed } from 'vue';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const props = defineProps({
  roomId: {
    type: String,
    required: true
  },
  chatRoomName: {
    type: String,
    required: true
  }, 
  removeChatFromList: {
    type: Function,
    required: true
  }
});

const authStore = useAuthStore()
const connectionStatus = ref('웹 소켓 시작')
const isConnected = ref(false)
const stompClient = ref(null)
const isVisible = ref(true);
const messages = computed(() => messagesInRoom.value[props.roomId] || []);
const newMessage = ref(''); // 새 입력 메세지
const subscriptions = ref({}) // 토픽 구독 채팅방 연결
const messagesInRoom = ref({})  // 각 채팅방 당 메세지


// 날짜 설정
const formatDate = (timeString) => {
  const date = new Date(timeString);
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일`
}
// 시간 설정
const formatTime = (timeString) => {
  const date = new Date(timeString);
  const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() < 12 ? '오전' : '오후';

  return `${ampm} ${hours}:${minutes}`; 
};
const shouldShowDate = (index) => {
  if(index === 0) return true;
  const currentDate = formatDate(messages.value[index].sentTime);
  const previousDate = formatDate(messages.value[index - 1].sentTime);
  return currentDate !== previousDate;
};

const connectWebSocket = () => {
  console.log('웹소켓 연결 시도 중...')
  if (stompClient.value?.connected) {
    console.log('이미 웹소켓이 연결되어 있습니다.');
    return;
  }

  // 환경변수나 설정에서 URL을 가져오는 것이 좋습니다
  const socket = new SockJS(`http://localhost:5000/ws?token=${authStore.accessToken}`, null, {
    transports: ['websocket', 'xhr-streaming', 'xhr-polling']
  });

  stompClient.value = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000, // 재연결 시간 줄임
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: function (str) {
      console.log('웹소켓 연결 상태: ',str)
      isConnected.value = true;
    },
    onConnect: (frame) => {
      console.log('STOMP 연결됨(success!!!): ' + frame)
      isConnected.value = true
      connectionStatus.value = '연결됨'
      subscribeToRoom(props.roomId) // 연결 성공 시 구독 실행
    },
    onStompError: (frame) => {
      console.error('STOMP 오류:', frame)
      isConnected.value = false;
      handleConnectionFailure('STOMP 오류: ' + frame.headers['messages'])
    },
    onDisconnect: () => {
      console.log('STOMP 연결 끊김');
      isConnected.value = false;
      connectionStatus.value = '연결 끊김';
      reconnectWebSocket();
    },
  });


  try {
    console.log('activate: ',stompClient.value)
    stompClient.value.activate()
    console.log('클라이언트 활성화 호출 성공!')
  } catch (error) {
    console.error('STOMP 클라이언트 활성화 실패:', error)
    isConnected.value = false;
  }
}


const subscribeToRoom = (roomId) => {
  if (subscriptions.value[roomId]) {
    console.warn(`이미 방 ${roomId}에 구독 중입니다.`);
    return;
  }

  subscriptions.value[roomId] = stompClient.value.subscribe(`/topic/room/${roomId}`, message => {
    console.log('메시지 수신:', message.body)
        const receivedMessage = JSON.parse(message.body); // 메시지 JSON 파싱
        receivedMessage.sentTime = formatDate(receivedMessage.sentTime);
        receivedMessage.sentTime = formatTime(receivedMessage.sentTime);
    if (!messagesInRoom.value[roomId]) {
      messagesInRoom.value[roomId] = []
    }
    messagesInRoom.value[roomId].push(receivedMessage)
  })
};


/** WebSocket 재연결 */
const reconnectWebSocket = () => {
  setTimeout(() => {
    if (!isConnected.value) connectWebSocket();
  }, 5000);
};


const sendMessage = () => {
  console.log('전송 시도~!')
  console.log('현재 메시지 값:', newMessage.value);
  if (!newMessage.value || !newMessage.value.trim()) {
  console.warn('빈 메시지는 전송할 수 없습니다.');
  return;
}

if (!isConnected.value) {
  console.error('웹소켓에 연결되지 않았습니다. 연결을 시도합니다...');
  connectWebSocket(); // 연결 시도
  return;
}

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
  console.log("publish")
  stompClient.value.publish({
    destination: `/app/room/${props.roomId}`,
    body: JSON.stringify(chatMessage),
  });
  newMessage.value = ''; // 메시지 초기화
} catch (error) {
  console.error('메시지 전송 중 오류:', error);
}

};


const leaveChat = async () => {
  try {
    const response = await axios.post(`/chat/room/${props.roomId}/leave`, null, {
      params: { userId: authStore.user?.userId },
    });
    console.log('채팅방을 나가기: ', response.data )
    console.log('API 요청 URL: ', axios.defaults.baseURL + `/chat/room/${props.roomId}/leave`);
    console.log('응답 데이터: ', response.data);

    isVisible.value = false;
    delete messagesInRoom.value[props.roomId];
    if(subscriptions.value[props.roomId]) {
      subscriptions.value[props.roomId].unsubscribe();
      delete subscriptions.value[props.roomId];
    }
    removeChatFromList(props.roomId)
  } catch (error) {
    console.error('채팅방 나가는 중 오류 발생:', error);
  }
};


onMounted(() => {
console.log('onMounted 실행');
connectWebSocket()
})

onUnmounted(() => {
if (stompClient.value) {
  console.log('STOMP 클라이언트 비활성화 중...')
  // Object.values(subscriptions.value).forEach(subscription => subscription.unsubscribe())
  stompClient.value.deactivate()
}
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

.leave-chat {
  position: absolute;
  margin-top: 1rem;
  margin-bottom: 1rem;
    top: 15px;
    right: 10px;
    background: none;
    border-color: #c7c5c5;
    border-radius: 20rem;
    font-size: 0.9rem;
    cursor: pointer;
    color: #c7c5c5;
}

.popup-content {
  padding: 20px;
  display: flex; 
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
  flex-direction: column;
  height: 100%;
}

h2 {
  margin: 0 0 20px 0;
  font-size: 1.5rem;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 15px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
}


.date-divider {
  text-align: center;
  font-size: 0.8rem;
  color: #999;
  margin: 10px 0;
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
  font-weight: bold;
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
}

.time-right {
  font-size: 0.6rem;
  color: #888;
  margin-left: 10px;
  align-self: flex-end;
}

.time {
  font-size: 0.5rem;
  color: #888;
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
  border-radius: 3px;
}
.chat-input button {
  /* padding: 8px 16px; */
  background-color: #ff9d85;
  color: rgb(34, 34, 34);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.chat-input button:hover {
  background-color: #fc8d71;
}

.close-button {
  position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: #c7c5c5;
}

.close-button:hover {
  color: #333;
}
</style>