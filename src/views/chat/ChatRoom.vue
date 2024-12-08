<template>
  <div v-if="isVisible" class="popup">
    <button class="close-button" @click="$emit('close')">X</button>
    <button class="leave-chat" @click="leaveChat">채팅방 나가기</button>
    <div class="popup-content">
      <h2>{{ props.chatRoomName }}</h2>
      <div class="chat-messages">
        <div v-for="(message, index) in messages" :key="index" class="message-line">
          <span class="sender">{{ message.senderName }}</span>
          <span class="content">{{ message.content }}</span>
          <span class="time">{{ message.sentTime }}</span>
        </div>
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

const props = defineProps({
  roomId: {
    type: String,
    required: true
  },
  chatRoomName: {
    type: String,
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


const connectWebSocket = () => {
  console.log('웹소켓 연결 시도 중...')
  if (stompClient.value?.connected) {
    console.log('이미 웹소켓이 연결되어 있습니다.');
    return;
  }

  // 환경변수나 설정에서 URL을 가져오는 것이 좋습니다
  const socket = new SockJS(`http://localhost:8080/ws?token=${authStore.accessToken}`, null, {
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
    if (!messagesInRoom.value[roomId]) {
      messagesInRoom.value[roomId] = []
    }
    messagesInRoom.value[roomId].push(JSON.parse(message.body))
  })
  // const subscription = stompClient.value.subscribe(`/topic/room/${roomId}`, (message) => {
  //   try {
  //     const receivedMessage = JSON.parse(message.body); // 메시지 JSON 파싱
  //     console.log(`방 ${roomId}에서 새 메시지 수신:`, receivedMessage);

  //     // 메시지 상태 업데이트
  //     if (!messagesInRoom.value[roomId]) {
  //       messagesInRoom.value[roomId] = [];
  //     }
  //     messagesInRoom.value[roomId].push(receivedMessage);
  //   } catch (error) {
  //     console.error(`방 ${roomId}에서 메시지 처리 중 오류 발생:`, error);
  //   }
  // });

  // subscriptions.value[roomId] = subscription;
  // console.log(`방 ${roomId}에 구독 완료.`);
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
    const response = await axios.post(`/room/${props.roomId}/leave`, null, {
      params: { userId: authStore.user?.userId },
    });
    console.log('채팅방을 나갑니다.')
    console.log('API 요청 URL: ', axios.defaults.baseURL + `/room/${props.roomId}/leave`);
    console.log('응답 데이터: ', response.data);
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

/* 팝업 콘텐츠 */
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 00px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
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
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.message {
  background-color: white;
  padding: 8px;
  margin: 8px 0;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-line {
  display: flex;
  gap: 10px;
  align-items: center;
}

.sender {
font-weight: bold;
font-size: 18px;
}
.content {
  font-size: 17px;
}
.time {
  color: #888;
  font-size: 0.8rem;
  margin-left: 10px;
}

.chat-input {
  display: flex;
  gap: 10px;
  height: 2.5rem;
  border: none;
}

.chat-input input {
  font-size: 0.9rem;
  width: 24rem;
  border-color: #c7c5c5;
  border-style: solid;
  border-radius: 3px;
}
.chat-input button {
  /* padding: 8px 16px; */
  background-color: #ff9d85;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
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