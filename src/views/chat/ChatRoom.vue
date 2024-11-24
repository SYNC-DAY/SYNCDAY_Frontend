<template>
  <div v-if="isVisible" class="popup">
    <button class="close-button" @click="closeRoom">X</button>
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
        <button @click="sendMessage">전송</button>
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

const subscribeToRoom = () => {
  if(stompClient.value&&isConnected.value) {
    stompClient.value.subscribe(`/topic/room/${props.roomId}/message`, message => {
      console.log('메시지 수신:', message);
      messages.value.push(JSON.parse(message.body));
    });
  }
};

// const closePopup = () => {
//   emit('update:isVisible', false);
// };

// 채팅방 오픈
// const openChatRoom = (roomId) => {
//   console.log(`Open chatRoom with ID: ${roomId}`);
// };

// 백엔드에서 채팅방 목록 가져옴
// const fetchChatList = async () => {
//   try {
//     const response = await axios.get('/chatroom');
//     // const data = await response.json();
//     chatlist.value = response.data.data;  // 채팅방 목록 업데이트
//   } catch (error){
//     console.error("채팅방 연결 실패: ", error);
//   }
// };   fetch가 아닌 send로 보내져야 함.
//   onMounted(() => {
//   console.log('onMounted 실행');
//   if (!stompClient.value) {
//     connectWebSocket();
//   } else {
//     console.log('stompClient가 이미 초기화되었습니다.');
//   }
// });
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
})
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