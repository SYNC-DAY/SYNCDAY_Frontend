<template>
  <div v-if="isVisible" class="popup">
    <button class="close-button" @click="closeRoom">X</button>
    <button class="leave-chat" @click="leaveChat">채팅방 나가기</button>
    <div class="popup-content">
      <h2>{{ currentRoom?.chatRoomName }}</h2>
      <div class="chat-messages">
        <div v-for="(message, index) in messages" :key="index" class="message">
          {{ message.content }}
        </div>
      </div>
      <div class="chat-input">
        <input 
          v-model="newMessage"   type="text"   placeholder="메시지를 입력하세요"  @keyup.enter="sendMessage" />
      <button @click="sendMessage">전송</button>
      <!-- <p>연결 상태: {{ connectionStatus }}</p> -->
    </div>
      </div>
    </div>
  

</template>

<script setup>
import { onUnmounted, onMounted, ref, defineProps, defineEmits } from 'vue';
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
const emit = defineEmits(['close']);
const isVisible = ref(true);
const messages = ref([]);
const newMessage = ref('');
const currentRoom = ref(props.roomInfo);
// const subscriptions = ref({}) 토픽 구독 채팅방 연결

const connectWebSocket = () => {
  console.log('웹소켓 연결 시도 중...')
  if (stompClient.value?.connected) {
    console.log('이미 웹소켓이 연결되어 있습니다.');
    return;
  }

  // 환경변수나 설정에서 URL을 가져오는 것이 좋습니다
  const socket = new SockJS('http://localhost:5000/ws');

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
      subscribeToRoom() // 연결 성공 시 구독 실행
    },
    onStompError: (frame) => {
      console.error('STOMP 오류:', frame)
      isConnected.value = false;
      handleConnectionFailure('STOMP 오류: ' + frame.headers['message'])
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
    handleConnectionFailure('활성화 실패')
  }
}

// 채팅방 메세지 구독
const subscribeToRoom = () => {   
  if (!stompClient.value || !isConnected.value) {
    console.error('STOMP 클라이언트가 준비되지 않았습니다')
    return
  }
  stompClient.value.subscribe(
    `/topic/room/message/${props.roomId}`,
    (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        messages.value.push(parsedMessage);
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    },
    { Authorization: `Bearer ${authStore.accessToken}` }
  );
};

/** WebSocket 재연결 */
const reconnectWebSocket = () => {
  setTimeout(() => {
    if (!isConnected.value) connectWebSocket();
  }, 5000);
};


// const changeRoom = () => {
//   if (stompClient.value && stompClient.value.connected) {
//     subscribeToRoom(currentRoom.value)
//   }
// }

// const handleConnectionFailure = (reason) => {
//   console.error(`연결 실패: ${reason}`)
//   isConnected.value = false
//   connectionStatus.value = '연결 실패'
// }

const sendMessage = () => {
  console.log('전송 시도~!')
  if (!isConnected.value || !stompClient.value?.connected) {
    console.error('웹소켓에 연결되지 않았습니다. 연결을 시도합니다...');
    connectWebSocket();
    return;
  }
  if (newMessage.value.trim()) {
    const chatMessage = {
      senderId: authStore.user?.userId,
      message: newMessage.value.trim(),
      chatType: 'MESSAGE',
    };
    try {
      stompClient.value.publish({
        destination: `/app/room/message/${props.roomId}`,
        body: JSON.stringify(chatMessage),
      });
      newMessage.value = ''; // 메시지 초기화
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
    }
  } else {
    console.warn('빈 메시지는 전송할 수 없습니다.');
  }
};

const closeRoom = () => {
  isVisible.value = false;
  emit('close');
};

const leaveChat = async () => {
  try {
    const response = await axios.post(`/api/chat/room/${props.roomId}/leave`, null, {
      params: { userId: authStore.user?.userId },
    });
    console.log('채팅방을 나갑니다.')
    console.log('API 요청 URL: ', axios.defaults.baseURL + `/api/chat/room/${props.roomId}/leave`);
    console.log('응답 데이터: ', response.data);
    // 필요 시 추가 동작 (e.g., 채팅방 목록 갱신)
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
    border-radius: 20rem;
    font-size: 1rem;
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

.newMessage {
  font-size: 0.5rem;
}
.chat-input {
  display: flex;
  gap: 1px;
  height: 3rem;
  /* justify-content: space-between; */
}

.chat-input button {
  /* padding: 8px 16px; */
  background-color: #ff9d85;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.5rem;
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