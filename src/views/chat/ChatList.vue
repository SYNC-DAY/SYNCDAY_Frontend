<template>
<<<<<<< Updated upstream
    <div class="chat-list">
      <!-- 채팅 리스트 헤더 -->
      <ChatRoomHeader />
  
      <!-- 채팅방 목록 -->
      <ul class="space-y-2 p-4">
        <li 
          v-for="room in chatRooms" 
          :key="room.id" 
          @click="selectRoom(room)"
          class="p-2 rounded-lg cursor-pointer hover:bg-gray-100"
        >
          <ChatInfoItem :room="room" />
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import ChatRoomHeader from './ChatRoomHeader.vue'
  import ChatInfoItem from './ChatInfoItem.vue'
  
  // 채팅방 목록 데이터와 선택된 채팅방 상태 정의
  const chatRooms = ref([])
  const selectedRoom = ref(null)
  
  // 채팅방 목록 데이터를 가져오는 함수
  async function fetchChatRooms() {
    try {
      const response = await axios.get('http://localhost:8080/api/chat/rooms')
      chatRooms.value = response.data
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
    }
  }
  
  // 채팅방 선택 핸들러
  function selectRoom(room) {
    selectedRoom.value = room
    // 선택된 채팅방 정보를 부모 컴포넌트에 전달
    emit('select-room', room)
  }
  
  // 컴포넌트 마운트 시 채팅방 목록 데이터를 가져옴
  onMounted(() => {
    fetchChatRooms()
  })
  </script>
  
  <style scoped>
  .chat-list {
    width: 300px;
    border-right: 1px solid #ddd;
  }
  </style>
  
=======
    <div>
      <div>
        <label for="roomSelect">Select Room:</label>
        <select id="roomSelect" v-model="currentRoom" @change="changeRoom">
          <option v-for="room in rooms" :key="room" :value="room">{{ room }}</option>
        </select>
      </div>
      <div v-for="(message, index) in currentMessages" :key="index">
        <strong>{{ message.sender }}:</strong> {{ message.message }}
      </div>
      <input v-model="newMessage" @keyup.enter="sendMessage" :disabled="!isConnected" />
      <button @click="sendMessage" :disabled="!isConnected">Send</button>
      <p>연결 상태: {{ connectionStatus }}</p>
    </div>
    <div>
    <button class="new-chat-button" @click="openModal">새 채팅</button>

    <!-- 모달 -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>대화 상대 선택</h2>
        <input
          type="text"
          v-model="searchTerm"
          placeholder="이름 검색"
          class="search-input"
        />
        <ul class="user-list">
          <li
            v-for="user in filteredUsers"
            :key="user.id"
            @click="selectUser(user)"
            :class="{ selected: selectedUser?.id === user.id }"
          >
            <img :src="user.avatar" alt="User Avatar" class="user-avatar" />
            <span>{{ user.name }}</span>
          </li>
        </ul>
        <div class="modal-actions">
          <button @click="createChat" :disabled="!selectedUser">채팅 생성</button>
          <button @click="closeModal">취소</button>
        </div>
      </div>
    </div>
    </div>
  </template>
  
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const newMessage = ref('')
const messagesPerRoom = ref({})
const isConnected = ref(false)
const stompClient = ref(null)
const connectionStatus = ref('웹소켓에 연결 중...')
const currentRoom = ref('room1')
const rooms = ref(['room1', 'room2', 'room3']) // 예시 방 목록
const subscriptions = ref({})

const currentMessages = computed(() => messagesPerRoom.value[currentRoom.value] || [])

const connectWebSocket = () => {
  console.log('웹소켓 연결 시도 중...')
  connectionStatus.value = '웹소켓에 연결 중...'

  const socket = new SockJS('http://localhost:5000/ws')
  console.log('SockJS 인스턴스 생성됨')

  stompClient.value = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: function (str) {
      console.log(str)
    },
    onConnect: frame => {
      console.log('STOMP 연결됨: ' + frame)
      isConnected.value = true
      connectionStatus.value = '연결됨'
      subscribeToRoom(currentRoom.value)
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
  stompClient.value.activate()
}

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
      destination: `/app/chat/${currentRoom.value}`,
      body: JSON.stringify(chatMessage)
    })
    newMessage.value = ''
  } else if (!isConnected.value) {
    console.error('웹소켓에 연결되지 않았습니다')
    connectionStatus.value = '메시지를 보낼 수 없습니다. 연결 중...'
  }
}

onMounted(() => {
  connectWebSocket()
})

onUnmounted(() => {
  if (stompClient.value) {
    console.log('STOMP 클라이언트 비활성화 중...')
    Object.values(subscriptions.value).forEach(subscription => subscription.unsubscribe())
    stompClient.value.deactivate()
  }
})


// 상태 관리
const isModalOpen = ref(false); // 모달 열림/닫힘 상태
const searchTerm = ref(""); // 검색어
const selectedUser = ref(null); // 선택한 사용자

// 검색 필터
const filteredUsers = computed(() =>
  users.value.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

// 모달 열기/닫기
const openModal = () => {
  isModalOpen.value = true;
  searchTerm.value = ""; // 검색어 초기화
  selectedUser.value = null; // 선택 초기화
};
const closeModal = () => {
  isModalOpen.value = false;
};

// 사용자 선택
const selectUser = (user) => {
  selectedUser.value = user;
};

// 채팅 생성
const createChat = () => {
  if (selectedUser.value) {
    alert(`${selectedUser.value.name}님과의 채팅방이 생성되었습니다!`);
    closeModal();
    // 여기에 채팅방 생성 로직 추가
  }
};
</script>

<style scoped>
/* 기본 스타일 */
.app {
  text-align: center;
  margin-top: 2rem;
}

.new-chat-button {
  background-color: #6c63ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  text-align: left;
}

.modal-content h2 {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-list li {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.user-list li:hover {
  background-color: #f0f0f0;
}

.user-list li.selected {
  background-color: #6c63ff;
  color: white;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-actions button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
>>>>>>> Stashed changes
