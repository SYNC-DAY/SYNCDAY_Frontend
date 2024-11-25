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
          v-model="newMessage" 
          type="text" 
          placeholder="메시지를 입력하세요"
          @keyup.enter="sendMessage" 
        />
      <button @click="sendMessage" :disabled="!isConnected">전송</button>
      <!-- <p>연결 상태: {{ connectionStatus }}</p> -->
    </div>
      </div>
    </div>
  

</template>

<script setup>
import { onUnmounted, onMounted, ref, defineProps, defineEmits, watch } from 'vue';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
// import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  roomId: {
    type: String,
    required: true
  },
  roomInfo: {
    type: Object,
    required: true
  }
});

// const authStore = useAuthStore()
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
  connectionStatus.value = '웹소켓에 연결 중...'

  const socket = new SockJS('http://localhost:5000/ws');
  console.log('SockJS 인스턴스 생성됨')

  stompClient.value = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: function (str) {
      console.log(str)
    },
    onConnect: frame => { // 연결 이벤트 핸들러
      console.log(frame)
      console.log('STOMP 연결됨(success!!!): ' + frame)
      isConnected.value = true
      connectionStatus.value = '연결됨'
      // subscribeToRoom(currentRoom.value)
      subscribeToRoom()
    },
    onStompError: frame => {
      console.error('STOMP 오류:', frame)
      handleConnectionFailure('STOMP 오류: ' + frame.headers['message'])
    },
    onDisconnect: () => {
      console.log('STOMP 연결 끊김')
      isConnected.value = false
      connectionStatus.value = '연결 끊김'
    },
    onWebSocketError: (event) => {
      console.error('WebSocket 오류 발생:', event)
      handleConnectionFailure('WebSocket 오류: ' + JSON.stringify(event))
    },
    onWebSocketClose: (event) => {
      console.log('WebSocket 연결 종료됨:', event)
    }
  })
  console.log('STOMP 클라이언트 활성화 중...')
  console.log('STOMP 클라이언트 상태:', stompClient.value)
  stompClient.value.activate()
  // wsConnect()
}

// const wsConnect = () => {
//   console.log(stompClient.value)
// }

//   stompClient.value.onConnect(
//     {Authorization: `Bearer ${authStore.accessToken}`}, // JWT 토큰 등 인증 정보 추가
//      (frame) => {
//     console.log('웹소켓 연결 완료!: ', frame);
//     stompClient.subscribe(`/topic/room/${roomId}/message`, (message) => {
//       console.log('새 메세지:', message.body);
//     });
//   }, (error) => {
//     console.log('STOMP 연결 실패: ', error);
//   }
// );

// subscriptions.value[roomId] = stompClient.value.subscribe(`/topic/room/${roomId}/message`, message => {
//     console.log('메시지 수신:', message)
//     if (!messagesPerRoom.value[roomId]) {
//       messagesPerRoom.value[roomId] = []
//     }
//     messagesPerRoom.value[roomId].push(JSON.parse(message.body))
//   })
//   stompClient.send(`/app/room/${roomId}/message`, {}, JSON.stringify({
//         sender: 'User',
//         content: 'Hello!',
//     }));

// const subscribeToRoom = () => {
//   if(stompClient.value&&isConnected.value) {
//     stompClient.value.subscribe(`/topic/room/message/${props.roomId}`, message => {
//       console.log('메시지 수신:', message);
//       messages.value.push(JSON.parse(message.body));
//     });
//   }
// };
const subscribeToRoom = (roomId) => {
  if (subscriptions.value[roomId]) {
    console.log(`Already subscribed to room ${roomId}`)
    return
  }

  subscriptions.value[roomId] = stompClient.value.subscribe(`/topic/messages/${roomId}`, message => {
    console.log('메시지 수신:', message)
    if (!messagesPerRoom.value[roomId]) {
      messagesPerRoom.value[roomId] = []
    }
    messagesPerRoom.value[roomId].push(JSON.parse(message.body))
  })
}

const changeRoom = () => {
  if (stompClient.value && stompClient.value.connected) {
    subscribeToRoom(currentRoom.value)
  }
}

const handleConnectionFailure = (reason) => {
  console.error(`연결 실패: ${reason}`)
  isConnected.value = false
  connectionStatus.value = '연결 실패'
}
const sendMessage = () => {
  if (newMessage.value && isConnected.value) {
    const chatMessage = {
      type: 'CHAT',
      roomId: currentRoom.value,
      sender: 'User1', // 실제 사용자 이름으로 변경 필요
      message: newMessage.value
    }
    
    console.log('메시지 전송:', chatMessage)
    stompClient.value.publish({
      destination: `/app//room/message/${roomId}`,
      body: JSON.stringify(chatMessage)
    })
    newMessage.value = ''
  } else if (!isConnected.value) {
    console.error('웹소켓에 연결되지 않았습니다')
    connectionStatus.value = '메시지를 보낼 수 없습니다. 연결 중...'
  }
};

const closeRoom = () => {
  isVisible.value = false;
  emit('close');
};

const leaveChat = async () => {
  try {
    const response = await axios.post(`/api/chat/room/${props.roomId}/leave`, null, {
      params: {
        userId: userId, // 실제 userId를 전달
      },
    });
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
  height: 600px;
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
  justify-content: space-between;
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